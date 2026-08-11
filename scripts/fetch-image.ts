import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PistaCerta/0.1 (https://github.com/br1ansouza/pistacerta-game)';
const TARGET_WIDTH = 900;
const WEBP_QUALITY = 78;

type ImageInfo = {
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
  console.error('uso: bun run scripts/fetch-image.ts <slug> <File:Nome.jpg>');
  process.exit(1);
}

const info = await commons<InfoResponse>({
  action: 'query',
  prop: 'imageinfo',
  titles: title,
  iiprop: 'url|extmetadata',
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

const download = await fetch(imageInfo.url, { headers: { 'User-Agent': USER_AGENT } });

if (!download.ok) {
  console.error(`Falha ao baixar (${download.status})`);
  process.exit(1);
}

const original = Buffer.from(await download.arrayBuffer());
const outputPath = join(process.cwd(), 'public', 'vehicles', `${slug}.webp`);

const output = await sharp(original)
  .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
  .webp({ quality: WEBP_QUALITY })
  .toBuffer();

await writeFile(outputPath, output);

const contentPath = join(process.cwd(), 'content', 'vehicles', 'cars', `${slug}.json`);
const vehicle = JSON.parse(await readFile(contentPath, 'utf8')) as Record<string, unknown>;

vehicle.image = {
  src: `/vehicles/${slug}.webp`,
  source: 'wikimedia',
  ...(author ? { author } : {}),
  license,
  sourceUrl: imageInfo.descriptionurl,
};

await writeFile(contentPath, `${JSON.stringify(vehicle, null, 2)}\n`);

const kb = Math.round(output.length / 1024);
console.log(`${slug}: ${kb} kB · ${license} · ${author ?? 'autor não declarado'}`);
