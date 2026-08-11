import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  imageDictionarySchema,
  vehicleSchema,
  type Image,
  type Vehicle,
  type VehicleKind,
} from './vehicle.schema.ts';

type VehicleRecord = Omit<Vehicle, 'image'>;

const CONTENT_ROOT = join(process.cwd(), 'content', 'vehicles');
const IMAGES_PATH = join(process.cwd(), 'content', 'images.json');

const DIRECTORY_BY_KIND: Record<VehicleKind, string> = {
  car: 'cars',
};

export class VehicleContentError extends Error {
  constructor(
    readonly file: string,
    readonly issues: string[],
  ) {
    super(`${file}: ${issues.join('; ')}`);
    this.name = 'VehicleContentError';
  }
}

async function readKind(kind: VehicleKind): Promise<VehicleRecord[]> {
  const directory = join(CONTENT_ROOT, DIRECTORY_BY_KIND[kind]);

  let fileNames: string[];
  try {
    fileNames = (await readdir(directory)).filter((name) => name.endsWith('.json')).toSorted();
  } catch {
    return [];
  }

  const vehicles = await Promise.all(
    fileNames.map(async (fileName) => {
      const raw = await readFile(join(directory, fileName), 'utf8');

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        throw new VehicleContentError(fileName, [
          `JSON inválido: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
        ]);
      }

      const result = vehicleSchema.safeParse(parsed);

      if (!result.success) {
        throw new VehicleContentError(
          fileName,
          result.error.issues.map(
            (issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`,
          ),
        );
      }

      const expectedFileName = `${result.data.slug}.json`;
      if (fileName !== expectedFileName) {
        throw new VehicleContentError(fileName, [
          `nome do arquivo deve casar com o slug (esperado ${expectedFileName})`,
        ]);
      }

      return result.data;
    }),
  );

  return vehicles;
}

async function readImageDictionary(): Promise<Record<string, Image>> {
  let raw: string;

  try {
    raw = await readFile(IMAGES_PATH, 'utf8');
  } catch {
    return {};
  }

  const parsed = imageDictionarySchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    throw new VehicleContentError(
      'images.json',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  return parsed.data;
}

let cache: Vehicle[] | null = null;

export async function loadAllVehicles(options: { fresh?: boolean } = {}): Promise<Vehicle[]> {
  if (cache && !options.fresh) {
    return cache;
  }

  const kinds = Object.keys(DIRECTORY_BY_KIND) as VehicleKind[];
  const [byKind, images] = await Promise.all([
    Promise.all(kinds.map(readKind)),
    readImageDictionary(),
  ]);
  const all = byKind.flat().map((vehicle) => ({
    ...vehicle,
    image: images[vehicle.slug] ?? null,
  }));

  const seenSlugs = new Set<string>();
  for (const vehicle of all) {
    if (seenSlugs.has(vehicle.slug)) {
      throw new VehicleContentError(`${vehicle.slug}.json`, ['slug duplicado entre veículos']);
    }
    seenSlugs.add(vehicle.slug);
  }

  cache = all;
  return all;
}

export async function getPlayableVehicles(kind?: VehicleKind): Promise<Vehicle[]> {
  const all = await loadAllVehicles();
  return all.filter((vehicle) => vehicle.active && (kind ? vehicle.kind === kind : true));
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const all = await loadAllVehicles();
  return all.find((vehicle) => vehicle.slug === slug) ?? null;
}

const BRAND_PENALTY = 0.18;
const DECADE_PENALTY = 0.55;

function weightFor(
  vehicle: Vehicle,
  recentBrands: readonly string[],
  recentDecades: readonly number[],
): number {
  let weight = 1;

  const brandIndex = recentBrands.indexOf(vehicle.brand);
  if (brandIndex !== -1) {
    weight *= BRAND_PENALTY * (1 + brandIndex / recentBrands.length);
  }

  if (recentDecades.includes(Math.floor(vehicle.year / 10))) {
    weight *= DECADE_PENALTY;
  }

  return Math.max(weight, 0.02);
}

function weightedPick(vehicles: readonly Vehicle[], weights: readonly number[]): Vehicle | null {
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    return vehicles[Math.floor(Math.random() * vehicles.length)] ?? null;
  }

  let cursor = Math.random() * total;

  for (const [index, vehicle] of vehicles.entries()) {
    cursor -= weights[index] ?? 0;

    if (cursor <= 0) {
      return vehicle;
    }
  }

  return vehicles.at(-1) ?? null;
}

export async function pickRandomVehicle(
  options: { kind?: VehicleKind; excludeSlugs?: readonly string[] } = {},
): Promise<Vehicle | null> {
  const playable = await getPlayableVehicles(options.kind);

  if (playable.length === 0) {
    return null;
  }

  const excludeSlugs = options.excludeSlugs ?? [];
  const excluded = new Set(excludeSlugs);
  const candidates = playable.filter((vehicle) => !excluded.has(vehicle.slug));
  const pool = candidates.length > 0 ? candidates : playable;

  const recent = excludeSlugs
    .map((slug) => playable.find((vehicle) => vehicle.slug === slug))
    .filter((vehicle): vehicle is Vehicle => vehicle !== undefined)
    .slice(0, 6);

  const recentBrands = recent.map((vehicle) => vehicle.brand);
  const recentDecades = recent.slice(0, 3).map((vehicle) => Math.floor(vehicle.year / 10));

  const weights = pool.map((vehicle) => weightFor(vehicle, recentBrands, recentDecades));

  return weightedPick(pool, weights);
}
