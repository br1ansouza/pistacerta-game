import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

type Patch = {
  power?: number;
  torque?: number;
  aspiration?: string;
  engineCode?: string;
  cylinders?: number;
  valves?: number;
};

const [patchPath] = process.argv.slice(2);

if (!patchPath) {
  console.error('uso: bun run scripts/enrich.ts <arquivo.json>');
  process.exit(1);
}

const patches = JSON.parse(await readFile(patchPath, 'utf8')) as Record<string, Patch>;
const carsDir = join(process.cwd(), 'content', 'vehicles', 'cars');
const files = await readdir(carsDir);

const CLUES = [
  'year',
  'fipe',
  'fuel',
  'displacement',
  'power',
  'origin',
  'torque',
  'aspiration',
  'transmission',
  'drivetrain',
  'bodyType',
  'cylinders',
  'doors',
  'valves',
  'engineCode',
];

let updated = 0;

for (const [slug, patch] of Object.entries(patches)) {
  const fileName = `${slug}.json`;

  if (!files.includes(fileName)) {
    console.error(`  ✖ ${slug}: arquivo não existe`);
    continue;
  }

  const path = join(carsDir, fileName);
  const vehicle = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;

  if (patch.power !== undefined) vehicle.power = { value: patch.power, unit: 'cv' };
  if (patch.torque !== undefined) vehicle.torque = { value: patch.torque, unit: 'kgfm' };
  if (patch.aspiration !== undefined) vehicle.aspiration = patch.aspiration;
  if (patch.engineCode !== undefined) vehicle.engineCode = patch.engineCode;
  if (patch.cylinders !== undefined) vehicle.cylinders = patch.cylinders;
  if (patch.valves !== undefined) vehicle.valves = patch.valves;

  vehicle.specSource = 'webmotors';
  vehicle.active = true;

  await writeFile(path, `${JSON.stringify(vehicle, null, 2)}\n`, 'utf8');

  const count = CLUES.filter((key) => vehicle[key] !== undefined && vehicle[key] !== null).length;
  console.log(`  ✓ ${slug.padEnd(34)} ${count} pistas`);
  updated += 1;
}

console.log(`\n${updated} veículo(s) enriquecido(s).`);
