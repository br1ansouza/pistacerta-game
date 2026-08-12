import { z } from 'zod';
import { buildChoices } from '../src/domain/round/choices.ts';
import { pickFromDeck } from '../src/domain/round/deck.ts';
import { toSafeVehicle, toVehicleIdentity } from '../src/domain/vehicle/safe-vehicle.ts';
import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';
import { errorResponse, jsonResponse, readJsonBody } from './_lib/http.ts';
import { readDeckToken, signDeckToken, signRoundToken } from './_lib/round-token.ts';

const requestSchema = z.object({
  mode: z.enum(['solo', 'duo']).default('solo'),
  deck: z.string().nullish().default(null),
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

  const { mode, deck } = parsed.data;
  const pool = await getPlayableVehicles('car');
  const picked = pickFromDeck(pool, await readDeckToken(deck));

  if (!picked) {
    return errorResponse('Nenhum veículo disponível', 503);
  }

  const { vehicle } = picked;

  return jsonResponse({
    token: await signRoundToken(vehicle.slug),
    deck: await signDeckToken(picked.seen),
    reshuffled: picked.reshuffled,
    mode,
    clues: toSafeVehicle(vehicle),
    identity: mode === 'duo' ? toVehicleIdentity(vehicle) : null,
    choices: mode === 'solo' ? buildChoices(vehicle, pool) : null,
  });
}
