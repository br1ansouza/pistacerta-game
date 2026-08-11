import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PistaCerta/0.1 (https://github.com/br1ansouza/pistacerta-game)';
const THUMB_WIDTH = 900;

type ImageInfo = {
  thumburl?: string;
  url: string;
  descriptionurl: string;
  extmetadata?: Record<string, { value: string }>;
};

type InfoResponse = {
  query?: { pages?: Record<string, { imageinfo?: ImageInfo[] }> };
};

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
  const url = new URL(API);
  url.search = new URLSearchParams({ ...params, format: 'json', origin: '*' }).toString();

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  if (!response.ok) {
    throw new Error(`Commons respondeu ${response.status}`);
  }

  return (await response.json()) as T;
}

const [slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ');

if (!slug || !title) {
  console.error('uso: bun run scripts/link-image.ts <slug> <File:Nome.jpg>');
  process.exit(1);
}

const info = await commons<InfoResponse>({
  action: 'query',
  prop: 'imageinfo',
  titles: title,
  iiprop: 'url|extmetadata',
  iiurlwidth: String(THUMB_WIDTH),
});

const page = Object.values(info.query?.pages ?? {})[0];
const imageInfo = page?.imageinfo?.[0];

if (!imageInfo) {
  console.error(`Não encontrei imageinfo para ${title}`);
  process.exit(1);
}

const meta = imageInfo.extmetadata ?? {};
const license = meta.LicenseShortName?.value ? stripHtml(meta.LicenseShortName.value) : null;
const author = meta.Artist?.value ? stripHtml(meta.Artist.value) : null;

if (!license) {
  console.error(`Sem licença declarada em ${title} — não vou usar.`);
  process.exit(1);
}

const dictionaryPath = join(process.cwd(), 'content', 'images.json');
const dictionary = JSON.parse(await readFile(dictionaryPath, 'utf8')) as Record<string, unknown>;

dictionary[slug] = {
  src: stripTracking(imageInfo.thumburl ?? imageInfo.url),
  source: 'wikimedia',
  ...(author ? { author } : {}),
  license,
  sourceUrl: imageInfo.descriptionurl,
};

const sorted = Object.fromEntries(
  Object.entries(dictionary).toSorted(([a], [b]) => a.localeCompare(b)),
);

await writeFile(dictionaryPath, `${JSON.stringify(sorted, null, 2)}\n`);

console.log(`${slug}: ${license} · ${author ?? 'autor não declarado'}`);
