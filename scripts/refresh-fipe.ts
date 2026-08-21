import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const API = 'https://parallelum.com.br/fipe/api/v2';
const THROTTLE_MS = 400;
const MAX_RETRIES = 5;

type PriceByCode = {
  price: string;
  referenceMonth: string;
  codeFipe: string;
  model: string;
};

type Vehicle = {
  slug: string;
  kind: 'car' | 'truck' | 'motorcycle';
  brand: string;
  model: string;
  year: number;
  fipe: { value: number; referenceMonth: string; fipeCode: string } | null;
};

const catalogs = [
  { directory: 'cars', apiType: 'cars', fuelCode: '1' },
  { directory: 'trucks', apiType: 'trucks', fuelCode: '3' },
  { directory: 'motorcycles', apiType: 'motorcycles', fuelCode: '1' },
] as const;

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d,]/g, '').replace(',', '.'));
}

function toReferenceMonth(label: string): string | null {
  const months: Record<string, string> = {
    janeiro: '01',
    fevereiro: '02',
    março: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12',
  };

  const match = /([a-zç]+)\s+de\s+(\d{4})/i.exec(label.toLowerCase());
  const month = match?.[1] ? months[match[1]] : undefined;

  return month && match?.[2] ? `${match[2]}-${month}` : null;
}

async function api<T>(path: string): Promise<T | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    await delay(THROTTLE_MS);
    const response = await fetch(`${API}${path}`);

    if (response.status === 429) {
      await delay(2000 * 2 ** attempt);
      continue;
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`${path} -> ${response.status}`);
    }

    return (await response.json()) as T;
  }

  throw new Error(`${path} -> esgotou as tentativas (429)`);
}

const changes: string[] = [];
const gone: string[] = [];
let checked = 0;

for (const catalog of catalogs) {
  const directory = join(process.cwd(), 'content', 'vehicles', catalog.directory);
  const fileNames = (await readdir(directory)).filter((name) => name.endsWith('.json')).toSorted();

  for (const fileName of fileNames) {
    const path = join(directory, fileName);
    const vehicle = JSON.parse(await readFile(path, 'utf8')) as Vehicle;

    if (!vehicle.fipe) {
      continue;
    }

    checked += 1;

    const prices = await api<PriceByCode[]>(
      `/${catalog.apiType}/${vehicle.fipe.fipeCode}/years/${vehicle.year}-${catalog.fuelCode}/history`,
    );

    const current = prices?.[0];

    if (!current) {
      gone.push(`${vehicle.slug}: código ${vehicle.fipe.fipeCode} não retornou preço`);
      continue;
    }

    const value = parsePrice(current.price);
    const referenceMonth = toReferenceMonth(current.referenceMonth) ?? vehicle.fipe.referenceMonth;

    if (value === vehicle.fipe.value && referenceMonth === vehicle.fipe.referenceMonth) {
      continue;
    }

    const before = vehicle.fipe.value;
    vehicle.fipe = { value, referenceMonth, fipeCode: vehicle.fipe.fipeCode };

    await writeFile(path, `${JSON.stringify(vehicle, null, 2)}\n`, 'utf8');

    const delta = value - before;
    const sign = delta > 0 ? '+' : '';
    changes.push(`${vehicle.slug}: ${before} -> ${value} (${sign}${delta}) · ${referenceMonth}`);
  }
}

console.log(`${checked} veículo(s) com FIPE conferido(s).`);

if (changes.length > 0) {
  console.log(`\n${changes.length} preço(s) atualizado(s):`);
  for (const change of changes) {
    console.log(`  ${change}`);
  }
} else {
  console.log('Nenhum preço mudou.');
}

if (gone.length > 0) {
  console.log(`\n${gone.length} código(s) sem retorno — revisar à mão:`);
  for (const item of gone) {
    console.log(`  ${item}`);
  }
  process.exitCode = 1;
}
