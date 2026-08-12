import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

type Patch = {
  version?: string;
  fuel?: string;
  displacement?: string;
  power?: number;
  torque?: number;
  aspiration?: string;
  transmission?: string;
  drivetrain?: string;
  bodyType?: string;
  engineCode?: string;
  cylinders?: number;
  valves?: number;
  doors?: number;
  specSource?: string;
  active?: boolean;
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
  'engineCode',
];

const MEASUREMENTS: Record<string, string> = { power: 'cv', torque: 'kgfm' };

let updated = 0;

for (const [slug, patch] of Object.entries(patches)) {
  const fileName = `${slug}.json`;

  if (!files.includes(fileName)) {
    console.error(`  ✖ ${slug}: arquivo não existe`);
    continue;
  }

  const path = join(carsDir, fileName);
  const vehicle = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      continue;
    }

    const unit = MEASUREMENTS[key];
    vehicle[key] = unit ? { value, unit } : value;
  }

  patch.specSource ??= 'carros-na-web';
  vehicle.specSource = patch.specSource;

  await writeFile(path, `${JSON.stringify(vehicle, null, 2)}\n`, 'utf8');

  const count = CLUES.filter((key) => vehicle[key] !== undefined && vehicle[key] !== null).length;
  console.log(`  ✓ ${slug.padEnd(34)} ${count} pistas`);
  updated += 1;
}

console.log(`\n${updated} veículo(s) enriquecido(s).`);
