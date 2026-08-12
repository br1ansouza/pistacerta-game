import type { GameMode } from '@/domain/round/round.types';
import type { RoundChoice } from '@/domain/round/choices';
import type { SafeVehicle, VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';

export type RoundResponse = {
  token: string;
  deck: string;
  reshuffled: boolean;
  mode: GameMode;
  clues: SafeVehicle;
  identity: VehicleIdentity | null;
  choices: RoundChoice[] | null;
};

export type RevealResponse = {
  identity: VehicleIdentity;
  correct: boolean | null;
};

export type ImageCredit = {
  vehicle: string;
  author: string | null;
  license: string | null;
  sourceUrl: string | null;
};

export type CreditsResponse = {
  credits: ImageCredit[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(
      detail?.error ?? `Falha na requisição (${response.status})`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

const STATIC = process.env.PUBLIC_STATIC === '1';

export function startRound(
  mode: GameMode,
  kind: VehicleKind,
  deck: string | null,
  signal?: AbortSignal,
): Promise<RoundResponse> {
  if (STATIC) {
    return import('@/lib/static-backend').then(({ startRoundStatic }) =>
      startRoundStatic(mode, deck),
    );
  }

  return post<RoundResponse>('/api/round', { mode, kind, deck }, signal);
}

export function revealVehicle(
  token: string,
  choiceId: string | null,
  signal?: AbortSignal,
): Promise<RevealResponse> {
  if (STATIC) {
    return import('@/lib/static-backend').then(({ revealVehicleStatic }) =>
      revealVehicleStatic(token, choiceId),
    );
  }

  return post<RevealResponse>('/api/reveal', { token, choiceId }, signal);
}

export async function fetchCredits(signal?: AbortSignal): Promise<CreditsResponse> {
  if (STATIC) {
    return import('@/lib/static-backend').then(({ fetchCreditsStatic }) => fetchCreditsStatic());
  }

  const response = await fetch('/api/credits', { signal });

  if (!response.ok) {
    throw new ApiError(`Falha na requisição (${response.status})`, response.status);
  }

  return (await response.json()) as CreditsResponse;
}
