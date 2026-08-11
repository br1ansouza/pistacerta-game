import { setTimeout as delay } from 'node:timers/promises';

const API = 'https://parallelum.com.br/fipe/api/v2';
const THROTTLE_MS = 250;

type Entry = { code: string; name: string };

type YearDetail = {
  price: string;
  codeFipe: string;
  referenceMonth: string;
  fuel: string;
};

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(`${path} -> ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

async function main() {
  const [brandQuery, modelQuery, yearQuery] = process.argv.slice(2);

  if (!brandQuery) {
    console.error('uso: bun run fipe <marca> [modelo] [ano]');
    process.exit(1);
  }

  const brands = await api<Entry[]>('/cars/brands');
  const brand = brands.find((item) => normalize(item.name).includes(normalize(brandQuery)));

  if (!brand) {
    console.error(`marca não encontrada: ${brandQuery}`);
    process.exit(1);
  }

  console.log(`marca: ${brand.name} (${brand.code})`);

  if (!modelQuery) {
    return;
  }

  const models = await api<Entry[]>(`/cars/brands/${brand.code}/models`);
  const matches = models.filter((item) => normalize(item.name).includes(normalize(modelQuery)));

  if (matches.length === 0) {
    console.error(`nenhum modelo com "${modelQuery}"`);
    process.exit(1);
  }

  for (const model of matches) {
    // Sequencial e com pausa: a API pública da FIPE tem limite diário de requisições.
    // oxlint-disable-next-line no-await-in-loop
    await delay(THROTTLE_MS);

    // oxlint-disable-next-line no-await-in-loop
    const years = await api<Entry[]>(`/cars/brands/${brand.code}/models/${model.code}/years`);
    const relevant = yearQuery
      ? years.filter((year) => year.name.startsWith(yearQuery))
      : years.slice(0, 3);

    if (relevant.length === 0) {
      continue;
    }

    console.log(`\n${model.name} (${model.code})`);

    for (const year of relevant) {
      // oxlint-disable-next-line no-await-in-loop
      await delay(THROTTLE_MS);

      // oxlint-disable-next-line no-await-in-loop
      const detail = await api<YearDetail>(
        `/cars/brands/${brand.code}/models/${model.code}/years/${year.code}`,
      );

      console.log(
        `  ${year.name} | ${detail.price} | codeFipe=${detail.codeFipe} | ref=${detail.referenceMonth} | fuel=${detail.fuel}`,
      );
    }
  }
}

await main();
