import { buildChoices, type RoundChoice } from '@/domain/round/choices';
import { pickFromDeck } from '@/domain/round/deck';
import type { GameMode } from '@/domain/round/round.types';
import type { VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import type { Vehicle } from '@/domain/vehicle/vehicle.schema';
import { VEHICLES, type SealedVehicle } from '@/generated/content';
import type { CreditsResponse, ImageCredit, RevealResponse, RoundResponse } from './api';

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

function readDeck(deck: string | null): string[] {
  if (!deck) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(deck);
    return Array.isArray(parsed) ? parsed.filter((slug) => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

const CANDIDATES = VEHICLES.map((entry) => ({
  slug: entry.slug,
  brand: entry.brand,
  year: entry.clues.year,
}));

const BY_SLUG = new Map(VEHICLES.map((entry) => [entry.slug, entry]));

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
  deck: string | null,
): Promise<RoundResponse> {
  const picked = pickFromDeck(CANDIDATES, readDeck(deck));

  if (!picked) {
    throw new Error('Nenhum veículo disponível');
  }

  const entry = BY_SLUG.get(picked.vehicle.slug) as SealedVehicle;
  const token = crypto.randomUUID();
  rounds.set(token, entry);

  return {
    token,
    deck: JSON.stringify(picked.seen),
    reshuffled: picked.reshuffled,
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

export async function fetchCreditsStatic(): Promise<CreditsResponse> {
  const { CREDITS } = await import('@/generated/credits');

  return {
    credits: VEHICLES.map((entry) => CREDITS[entry.slug]).filter(
      (credit): credit is ImageCredit => credit !== undefined,
    ),
  };
}
