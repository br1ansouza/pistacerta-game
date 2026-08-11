import { z } from 'zod';
import { buildChoices } from '../src/domain/round/choices.ts';
import { toSafeVehicle, toVehicleIdentity } from '../src/domain/vehicle/safe-vehicle.ts';
import {
  getPlayableVehicles,
  pickRandomVehicle,
} from '../src/domain/vehicle/vehicle.repository.ts';
import { errorResponse, jsonResponse, readJsonBody } from './_lib/http.ts';
import { signRoundToken, slugsFromTokens } from './_lib/round-token.ts';

const requestSchema = z.object({
  mode: z.enum(['solo', 'duo']).default('solo'),
  recentTokens: z.array(z.string()).max(50).default([]),
});

export async function handleRound(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Método não permitido', 405);
  }

  const body = await readJsonBody<unknown>(request);
  const parsed = requestSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return errorResponse('Requisição inválida', 400);
  }

  const { mode, recentTokens } = parsed.data;
  const excludeSlugs = await slugsFromTokens(recentTokens);
  const vehicle = await pickRandomVehicle({ kind: 'car', excludeSlugs });

  if (!vehicle) {
    return errorResponse('Nenhum veículo disponível', 503);
  }

  const pool = await getPlayableVehicles('car');

  return jsonResponse({
    token: await signRoundToken(vehicle.slug),
    mode,
    clues: toSafeVehicle(vehicle),
    identity: mode === 'duo' ? toVehicleIdentity(vehicle) : null,
    choices: mode === 'solo' ? buildChoices(vehicle, pool) : null,
  });
}
