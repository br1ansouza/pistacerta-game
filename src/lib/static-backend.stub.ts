import type { GameMode } from '@/domain/round/round.types';
import type { CreditsResponse, RevealResponse, RoundResponse } from './api';

const MESSAGE = 'Modo estático não faz parte deste build.';

export function startRoundStatic(_mode: GameMode, _deck: string | null): Promise<RoundResponse> {
  return Promise.reject(new Error(MESSAGE));
}

export function revealVehicleStatic(
  _token: string,
  _choiceId: string | null,
): Promise<RevealResponse> {
  return Promise.reject(new Error(MESSAGE));
}

export function fetchCreditsStatic(): Promise<CreditsResponse> {
  return Promise.reject(new Error(MESSAGE));
}
