import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { loadAllVehicles } from '../src/domain/vehicle/vehicle.repository.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PistaCerta/0.1 (https://github.com/br1ansouza/pistacerta-game)';
const THUMB_WIDTH = 900;
const THROTTLE_MS = 350;

const REJECT =
  /interior|engine|motor|dashboard|badge|logo|emblem|wheel|rear|traseir|detail|part|seat|crash|rally|race|police|taxi|toy|model kit|miniatur/i;

type SearchResponse = { query?: { search?: { title: string }[] } };

type ImageInfo = {
  thumburl?: string;
  url: string;
  descriptionurl: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, { value: string }>;
};

type InfoResponse = { query?: { pages?: Record<string, { imageinfo?: ImageInfo[] }> } };

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTracking(url: string): string {
  const parsed = new URL(url);
  parsed.search = '';
  return parsed.toString();
}

async function commons<T>(params: Record<string, string>): Promise<T> {
  await delay(THROTTLE_MS);
  const url = new URL(API);
  url.search = new URLSearchParams({ ...params, format: 'json', origin: '*' }).toString();

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  if (!response.ok) {
    throw new Error(`Commons respondeu ${response.status}`);
  }

  return (await response.json()) as T;
}

async function search(term: string): Promise<string[]> {
  const result = await commons<SearchResponse>({
    action: 'query',
    list: 'search',
    srsearch: `${term} filetype:bitmap`,
    srnamespace: '6',
    srlimit: '12',
  });

  return (result.query?.search ?? []).map((item) => item.title);
}

async function describe(title: string): Promise<ImageInfo | null> {
  const info = await commons<InfoResponse>({
    action: 'query',
    prop: 'imageinfo',
    titles: title,
    iiprop: 'url|extmetadata|size',
    iiurlwidth: String(THUMB_WIDTH),
  });

  return Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0] ?? null;
}

const dictionaryPath = join(process.cwd(), 'content', 'images.json');
const dictionary = JSON.parse(await readFile(dictionaryPath, 'utf8')) as Record<string, unknown>;

const vehicles = await loadAllVehicles({ fresh: true });
const missing = vehicles.filter((vehicle) => !dictionary[vehicle.slug]);

console.log(`${missing.length} veículo(s) sem imagem.\n`);

let linked = 0;
const failed: string[] = [];

for (const vehicle of missing) {
  const terms = [
    `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    `${vehicle.brand} ${vehicle.model}`,
  ];

  let picked: { title: string; info: ImageInfo } | null = null;

  for (const term of terms) {
    const titles = await search(term);

    const plausible = titles.filter(
      (title) =>
        !REJECT.test(title) && new RegExp(vehicle.model.split(' ')[0] ?? '', 'i').test(title),
    );

    for (const title of plausible.slice(0, 4)) {
      const info = await describe(title);

      if (!info?.extmetadata?.LicenseShortName?.value) {
        continue;
      }

      if ((info.width ?? 0) < 600) {
        continue;
      }

      const isLandscape = (info.width ?? 0) >= (info.height ?? 1);

      if (!isLandscape) {
        continue;
      }

      picked = { title, info };
      break;
    }

    if (picked) break;
  }

  if (!picked) {
    failed.push(`${vehicle.slug} (${vehicle.brand} ${vehicle.model})`);
    console.log(`  ✖ ${vehicle.slug}`);
    continue;
  }

  const meta = picked.info.extmetadata ?? {};

  dictionary[vehicle.slug] = {
    src: stripTracking(picked.info.thumburl ?? picked.info.url),
    source: 'wikimedia',
    ...(meta.Artist?.value ? { author: stripHtml(meta.Artist.value) } : {}),
    license: stripHtml(meta.LicenseShortName?.value ?? ''),
    sourceUrl: picked.info.descriptionurl,
  };

  linked += 1;
  console.log(`  ✓ ${vehicle.slug.padEnd(34)} ${picked.title}`);
}

const sorted = Object.fromEntries(
  Object.entries(dictionary).toSorted(([a], [b]) => a.localeCompare(b)),
);

await writeFile(dictionaryPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

console.log(`\n${linked} linkado(s), ${failed.length} sem imagem plausível.`);

if (failed.length > 0) {
  console.log('\nSem match — precisam de escolha manual:');
  for (const item of failed) {
    console.log(`  ${item}`);
  }
}
