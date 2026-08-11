import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const API = 'https://parallelum.com.br/fipe/api/v2';
const THROTTLE_MS = 400;
const MAX_RETRIES = 6;
const CACHE_DIR = join(process.cwd(), 'node_modules', '.cache', 'fipe');

type Entry = { code: string; name: string };

type YearDetail = {
  price: string;
  codeFipe: string;
  fuel: string;
  model: string;
  brand: string;
};

type Pick = {
  slug: string;
  brand: string;
  brandCode: string;
  model: string;
  match: string;
  year: number;
  bodyType: string;
  origin: 'nacional' | 'importado';
  generation?: string;
  countryOfOrigin?: string;
};

await mkdir(CACHE_DIR, { recursive: true });

function cacheKey(path: string): string {
  return join(CACHE_DIR, `${path.replaceAll('/', '_')}.json`);
}

async function api<T>(path: string): Promise<T> {
  const key = cacheKey(path);

  try {
    return JSON.parse(await readFile(key, 'utf8')) as T;
  } catch {
    // sem cache, segue para a rede
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    await delay(THROTTLE_MS);
    const response = await fetch(`${API}${path}`);

    if (response.status === 429) {
      const wait = 2000 * 2 ** attempt;
      console.log(`  … 429, esperando ${wait / 1000}s`);
      await delay(wait);
      continue;
    }

    if (!response.ok) {
      throw new Error(`${path} -> ${response.status}`);
    }

    const body = (await response.json()) as T;
    await writeFile(key, JSON.stringify(body), 'utf8');
    return body;
  }

  throw new Error(`${path} -> esgotou as tentativas (429)`);
}

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d,]/g, '').replace(',', '.'));
}

function parseDisplacement(name: string): string | undefined {
  const match = /(?<![\d.])(\d\.\d)(?![\d])/.exec(name);
  return match?.[1];
}

function parsePower(name: string): number | undefined {
  const match = /(\d{2,3})\s?cv/i.exec(name);
  return match?.[1] ? Number(match[1]) : undefined;
}

function parseValves(name: string): number | undefined {
  const match = /(\d{1,2})\s?v\b/i.exec(name);
  return match?.[1] ? Number(match[1]) : undefined;
}

function parseDoors(name: string): number | undefined {
  const match = /(\d)p\b/.exec(name);
  return match?.[1] ? Number(match[1]) : undefined;
}

function parseTransmission(name: string): string | undefined {
  if (/\bcvt\b/i.test(name)) return 'cvt';
  if (/dualogic|automatiz|dsg|i-motion|easytronic|tiptronic/i.test(name)) return 'automatizado';
  if (/\baut\b|\baut\.|autom[áa]tic/i.test(name)) return 'automático';
  if (/\bmec\b|\bmec\.|manual/i.test(name)) return 'manual';
  return undefined;
}

function parseDrivetrain(name: string): string | undefined {
  if (/4x4|awd|4wd|quattro|4motion|integral/i.test(name)) return 'integral';
  return undefined;
}

function parseAspiration(name: string): string | undefined {
  if (/\btb\b|turbo|tdi|tsi|tfsi|thp|gdi t|t-?jet|firefly turbo|ecoboost/i.test(name)) {
    return 'turbo';
  }
  return undefined;
}

function parseFuel(fuel: string): string | undefined {
  const normalized = fuel.toLowerCase();
  if (normalized.includes('diesel')) return 'diesel';
  if (normalized.includes('flex') || normalized.includes('álcool')) return 'flex';
  if (normalized.includes('gasolina')) return 'gasolina';
  return undefined;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const picksPath = join(process.cwd(), 'scripts', 'fipe-picks.json');
const picks = JSON.parse(await readFile(picksPath, 'utf8')) as Pick[];
const onlySlug = process.argv[2];
const targets = onlySlug ? picks.filter((p) => p.slug === onlySlug) : picks;

const carsDir = join(process.cwd(), 'content', 'vehicles', 'cars');
const failures: string[] = [];
let written = 0;

for (const pick of targets) {
  const models = await api<Entry[]>(`/cars/brands/${pick.brandCode}/models`);
  const candidates = models.filter((m) => normalize(m.name).includes(normalize(pick.match)));

  if (candidates.length === 0) {
    const hint = models
      .filter((m) => normalize(m.name).includes(normalize(pick.model)))
      .slice(0, 6)
      .map((m) => m.name);
    failures.push(
      `${pick.slug}: nada casa com "${pick.match}"${hint.length > 0 ? ` | opções: ${hint.join(' / ')}` : ''}`,
    );
    continue;
  }

  let chosen: { model: Entry; year: Entry } | null = null;

  for (const candidate of candidates) {
    const years = await api<Entry[]>(
      `/cars/brands/${pick.brandCode}/models/${candidate.code}/years`,
    );
    const match = years.find((y) => y.name.startsWith(String(pick.year)));

    if (match) {
      chosen = { model: candidate, year: match };
      break;
    }
  }

  if (!chosen) {
    const firstCandidate = candidates[0];
    if (!firstCandidate) {
      failures.push(`${pick.slug}: sem candidatos`);
      continue;
    }
    const years = await api<Entry[]>(
      `/cars/brands/${pick.brandCode}/models/${firstCandidate.code}/years`,
    );
    failures.push(
      `${pick.slug}: ano ${pick.year} indisponível | ${firstCandidate.name} tem: ${years
        .map((y) => y.name.split(' ')[0])
        .slice(0, 8)
        .join(', ')}`,
    );
    continue;
  }

  const detail = await api<YearDetail>(
    `/cars/brands/${pick.brandCode}/models/${chosen.model.code}/years/${chosen.year.code}`,
  );

  const name = detail.model;
  const power = parsePower(name);
  const displacement = parseDisplacement(name);
  const transmission = parseTransmission(name);
  const drivetrain = parseDrivetrain(name);
  const aspiration = parseAspiration(name);
  const doors = parseDoors(name);
  const valves = parseValves(name);
  const fuel = parseFuel(detail.fuel);

  const vehicle = {
    slug: pick.slug,
    kind: 'car',
    brand: pick.brand,
    model: pick.model,
    ...(pick.generation ? { generation: pick.generation } : {}),
    year: pick.year,
    origin: pick.origin,
    ...(pick.countryOfOrigin ? { countryOfOrigin: pick.countryOfOrigin } : {}),
    ...(fuel ? { fuel } : {}),
    ...(displacement ? { displacement } : {}),
    ...(power ? { power: { value: power, unit: 'cv' } } : {}),
    ...(aspiration ? { aspiration } : {}),
    ...(transmission ? { transmission } : {}),
    ...(drivetrain ? { drivetrain } : {}),
    bodyType: pick.bodyType,
    ...(doors ? { doors } : {}),
    ...(valves ? { valves } : {}),
    fipe: {
      value: parsePrice(detail.price),
      referenceMonth: '2026-08',
      fipeCode: detail.codeFipe,
    },
    specSource: 'fipe',
    active: true,
  };

  await writeFile(
    join(carsDir, `${pick.slug}.json`),
    `${JSON.stringify(vehicle, null, 2)}\n`,
    'utf8',
  );

  written += 1;
  console.log(
    `${pick.slug.padEnd(34)} ${displacement ?? '—'} ${power ? `${power}cv` : '—'} ${fuel ?? '—'} · ${name}`,
  );
}

console.log(`\n${written} veículo(s) gravado(s).`);

if (failures.length > 0) {
  console.log(`\n${failures.length} falha(s):`);
  for (const failure of failures) {
    console.log(`  ${failure}`);
  }
}
