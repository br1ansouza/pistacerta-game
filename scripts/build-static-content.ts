import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';
import { toSafeVehicle, toVehicleIdentity } from '../src/domain/vehicle/safe-vehicle.ts';

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

const vehicles = await getPlayableVehicles();

if (vehicles.length === 0) {
  console.error('Nenhum veículo ativo — nada a gerar.');
  process.exit(1);
}

const rawKey = crypto.getRandomValues(new Uint8Array(32));
const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt']);

const entries = await Promise.all(
  vehicles.map(async (vehicle) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const identity = JSON.stringify(toVehicleIdentity(vehicle));

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(identity),
    );

    const packed = new Uint8Array(iv.length + ciphertext.byteLength);
    packed.set(iv, 0);
    packed.set(new Uint8Array(ciphertext), iv.length);

    return {
      slug: vehicle.slug,
      kind: vehicle.kind,
      brand: vehicle.brand,
      model: vehicle.model,
      clues: toSafeVehicle(vehicle),
      sealed: toBase64(packed),
    };
  }),
);

const outputDir = join(process.cwd(), 'src', 'generated');
await mkdir(outputDir, { recursive: true });

await writeFile(
  join(outputDir, 'content.ts'),
  `// Gerado por scripts/build-static-content.ts — não editar à mão.
import type { SafeVehicle } from '@/domain/vehicle/safe-vehicle';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';

export type SealedVehicle = {
  slug: string;
  kind: VehicleKind;
  brand: string;
  model: string;
  clues: SafeVehicle;
  sealed: string;
};

export const VEHICLES: SealedVehicle[] = ${JSON.stringify(entries, null, 2)};
`,
  'utf8',
);

await writeFile(
  join(outputDir, 'seal-key.ts'),
  `// Gerado por scripts/build-static-content.ts — não editar à mão.
export const SEAL_KEY = '${toBase64(rawKey)}';
`,
  'utf8',
);

const credits = vehicles
  .filter((vehicle) => vehicle.image !== null)
  .map((vehicle) => [
    vehicle.slug,
    {
      vehicle: [vehicle.brand, vehicle.model, vehicle.version, vehicle.year]
        .filter(Boolean)
        .join(' '),
      author: vehicle.image?.author ?? null,
      license: vehicle.image?.license ?? null,
      sourceUrl: vehicle.image?.sourceUrl ?? null,
    },
  ]);

await writeFile(
  join(outputDir, 'credits.ts'),
  `// Gerado por scripts/build-static-content.ts — não editar à mão.
import type { ImageCredit } from '@/lib/api';

export const CREDITS: Record<string, ImageCredit> = ${JSON.stringify(
    Object.fromEntries(credits),
    null,
    2,
  )};
`,
  'utf8',
);

console.log(`${entries.length} veículo(s) selados para o build estático.`);
