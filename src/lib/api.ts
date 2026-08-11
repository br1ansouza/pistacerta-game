import type { SafeVehicle, VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import type { GameMode } from '@/domain/round/round.types';

export type RoundResponse = {
  token: string;
  mode: GameMode;
  clues: SafeVehicle;
  identity: VehicleIdentity | null;
};

export type RevealResponse = {
  identity: VehicleIdentity;
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

export function startRound(
  mode: GameMode,
  recentTokens: readonly string[],
  signal?: AbortSignal,
): Promise<RoundResponse> {
  return post<RoundResponse>('/api/round', { mode, recentTokens }, signal);
}

export function revealVehicle(token: string, signal?: AbortSignal): Promise<RevealResponse> {
  return post<RevealResponse>('/api/reveal', { token }, signal);
}
