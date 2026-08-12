import { z } from 'zod';
import { buildChoices } from '../src/domain/round/choices.ts';
import { pickFromDeck } from '../src/domain/round/deck.ts';
import { toSafeVehicle, toVehicleIdentity } from '../src/domain/vehicle/safe-vehicle.ts';
import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';
import {
  deckCookie,
  deckFromCookie,
  errorResponse,
  jsonResponse,
  readJsonBody,
} from './_lib/http.ts';
import { readDeckDigests, signDeckToken, signRoundToken } from './_lib/round-token.ts';

const requestSchema = z.object({
  mode: z.enum(['solo', 'duo']).default('solo'),
  kind: z.enum(['car', 'truck']).default('car'),
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

  const { mode, kind, deck } = parsed.data;
  const pool = await getPlayableVehicles(kind);
  const slugs = pool.map((vehicle) => vehicle.slug);
  const [fromBody, fromCookie] = await Promise.all([
    readDeckDigests(deck, slugs),
    readDeckDigests(deckFromCookie(request, kind), slugs),
  ]);
  const state = fromCookie.seen.length > fromBody.seen.length ? fromCookie : fromBody;
  const picked = pickFromDeck(pool, state.seen);

  if (!picked) {
    return errorResponse('Nenhum veículo disponível', 503);
  }

  const { vehicle } = picked;
  const nextDeck = await signDeckToken(picked.seen, state.carry);

  return jsonResponse(
    {
      token: await signRoundToken(vehicle.slug),
      deck: nextDeck,
      reshuffled: picked.reshuffled,
      mode,
      clues: toSafeVehicle(vehicle),
      identity: mode === 'duo' ? toVehicleIdentity(vehicle) : null,
      choices: mode === 'solo' ? buildChoices(vehicle, pool) : null,
    },
    200,
    { 'Set-Cookie': deckCookie(kind, nextDeck) },
  );
}
