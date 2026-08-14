import { setTimeout as delay } from 'node:timers/promises';

const API = 'https://parallelum.com.br/fipe/api/v2';
const THROTTLE_MS = 250;
const MAX_RETRIES = 5;

type Entry = { code: string; name: string };

type YearDetail = {
  price: string;
  codeFipe: string;
  referenceMonth: string;
  fuel: string;
};

async function api<T>(path: string): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const response = await fetch(`${API}${path}`);

    if (response.status === 429) {
      await delay(2000 * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      throw new Error(`${path} -> ${response.status}`);
    }

    return (await response.json()) as T;
  }

  throw new Error(`${path} -> esgotou as tentativas (429)`);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

async function main() {
  const args = process.argv.slice(2);
  const vehicleType = args[0] === '--truck' ? 'trucks' : 'cars';
  const [brandQuery, modelQuery, yearQuery] = vehicleType === 'trucks' ? args.slice(1) : args;

  if (!brandQuery) {
    console.error('uso: bun run fipe [--truck] <marca> [modelo] [ano]');
    process.exit(1);
  }

  const brands = await api<Entry[]>(`/${vehicleType}/brands`);
  const normalizedBrand = normalize(brandQuery);
  const brand =
    brands.find((item) => normalize(item.name) === normalizedBrand) ??
    brands.find((item) => normalize(item.name).includes(normalizedBrand));

  if (!brand) {
    console.error(`marca não encontrada: ${brandQuery}`);
    process.exit(1);
  }

  console.log(`marca: ${brand.name} (${brand.code})`);

  if (!modelQuery) {
    return;
  }

  const models = await api<Entry[]>(`/${vehicleType}/brands/${brand.code}/models`);
  const matches = models.filter((item) => normalize(item.name).includes(normalize(modelQuery)));

  if (matches.length === 0) {
    console.error(`nenhum modelo com "${modelQuery}"`);
    process.exit(1);
  }

  for (const model of matches) {
    await delay(THROTTLE_MS);

    const years = await api<Entry[]>(
      `/${vehicleType}/brands/${brand.code}/models/${model.code}/years`,
    );
    const relevant = yearQuery
      ? years.filter((year) => year.name.startsWith(yearQuery))
      : years.slice(0, 3);

    if (relevant.length === 0) {
      continue;
    }

    console.log(`\n${model.name} (${model.code})`);

    for (const year of relevant) {
      await delay(THROTTLE_MS);

      const detail = await api<YearDetail>(
        `/${vehicleType}/brands/${brand.code}/models/${model.code}/years/${year.code}`,
      );

      console.log(
        `  ${year.name} | ${detail.price} | codeFipe=${detail.codeFipe} | ref=${detail.referenceMonth} | fuel=${detail.fuel}`,
      );
    }
  }
}

await main();
