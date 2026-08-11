import { buildChoices, type RoundChoice } from '@/domain/round/choices';
import type { GameMode } from '@/domain/round/round.types';
import type { VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import type { Vehicle } from '@/domain/vehicle/vehicle.schema';
import { VEHICLES, type SealedVehicle } from '@/generated/content';
import type { RevealResponse, RoundResponse } from './api';

const decoder = new TextDecoder();
const rounds = new Map<string, SealedVehicle>();

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (const [index, char] of [...binary].entries()) {
    bytes[index] = char.charCodeAt(0);
  }

  return bytes;
}

let cachedKey: Promise<CryptoKey> | null = null;

async function getKey(): Promise<CryptoKey> {
  cachedKey ??= import('@/generated/seal-key').then(({ SEAL_KEY }) =>
    crypto.subtle.importKey('raw', fromBase64(SEAL_KEY), { name: 'AES-GCM' }, false, ['decrypt']),
  );

  return cachedKey;
}

async function unseal(entry: SealedVehicle): Promise<VehicleIdentity> {
  const packed = fromBase64(entry.sealed);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: packed.subarray(0, 12) },
    await getKey(),
    packed.subarray(12),
  );

  return JSON.parse(decoder.decode(plaintext)) as VehicleIdentity;
}

const BRAND_PENALTY = 0.18;
const DECADE_PENALTY = 0.55;

function pick(recentTokens: readonly string[]): SealedVehicle {
  const recent = recentTokens
    .map((token) => rounds.get(token))
    .filter((entry): entry is SealedVehicle => entry !== undefined);

  const excluded = new Set(recent.map((entry) => entry.slug));
  const candidates = VEHICLES.filter((entry) => !excluded.has(entry.slug));
  const pool = candidates.length > 0 ? candidates : VEHICLES;

  const recentBrands = recent.slice(0, 6).map((entry) => entry.brand);
  const recentDecades = new Set(
    recent.slice(0, 3).map((entry) => Math.floor(entry.clues.year / 10)),
  );

  const weights = pool.map((entry) => {
    let weight = 1;
    const brandIndex = recentBrands.indexOf(entry.brand);

    if (brandIndex !== -1) {
      weight *= BRAND_PENALTY * (1 + brandIndex / recentBrands.length);
    }

    if (recentDecades.has(Math.floor(entry.clues.year / 10))) {
      weight *= DECADE_PENALTY;
    }

    return Math.max(weight, 0.02);
  });

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * total;

  for (const [index, entry] of pool.entries()) {
    cursor -= weights[index] ?? 0;

    if (cursor <= 0) {
      return entry;
    }
  }

  return pool[0] as SealedVehicle;
}

function asVehicle(entry: SealedVehicle): Vehicle {
  return { ...entry.clues, slug: entry.slug, brand: entry.brand, model: entry.model } as Vehicle;
}

function toChoices(answer: SealedVehicle): RoundChoice[] {
  return buildChoices(
    asVehicle(answer),
    VEHICLES.map((entry) => asVehicle(entry)),
  );
}

export async function startRoundStatic(
  mode: GameMode,
  recentTokens: readonly string[],
): Promise<RoundResponse> {
  const entry = pick(recentTokens);
  const token = crypto.randomUUID();
  rounds.set(token, entry);

  return {
    token,
    mode,
    clues: entry.clues,
    identity: mode === 'duo' ? await unseal(entry) : null,
    choices: mode === 'solo' ? toChoices(entry) : null,
  };
}

export async function revealVehicleStatic(
  token: string,
  choiceId: string | null,
): Promise<RevealResponse> {
  const entry = rounds.get(token);

  if (!entry) {
    throw new Error('Rodada não encontrada');
  }

  return {
    identity: await unseal(entry),
    correct: choiceId === null ? null : choiceId === entry.slug,
  };
}
