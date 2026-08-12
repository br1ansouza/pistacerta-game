import { z } from 'zod';
import { buildChoices } from '@/domain/round/choices';
import { pickFromDeck } from '@/domain/round/deck';
import { describeVehicle, toSafeVehicle, toVehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import { VEHICLES } from '@/generated/vehicles';
import { readDeckToken, signDeckToken, signRoundToken, verifyRoundToken } from './round-token';

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  ROUND_TOKEN_SECRET?: string;
};

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

const roundSchema = z.object({
  mode: z.enum(['solo', 'duo']).default('solo'),
  deck: z.string().nullish().default(null),
});

const revealSchema = z.object({
  token: z.string().min(1),
  choiceId: z.string().min(1).nullable().default(null),
});

async function handleRound(request: Request, secret: string): Promise<Response> {
  const parsed = roundSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return json({ error: 'Requisição inválida' }, 400);
  }

  const { mode, deck } = parsed.data;
  const picked = pickFromDeck(VEHICLES, await readDeckToken(deck, secret));

  if (!picked) {
    return json({ error: 'Nenhum veículo disponível' }, 503);
  }

  const { vehicle } = picked;

  return json({
    token: await signRoundToken(vehicle.slug, secret),
    deck: await signDeckToken(picked.seen, secret),
    reshuffled: picked.reshuffled,
    mode,
    clues: toSafeVehicle(vehicle),
    identity: mode === 'duo' ? toVehicleIdentity(vehicle) : null,
    choices: mode === 'solo' ? buildChoices(vehicle, VEHICLES) : null,
  });
}

async function handleReveal(request: Request, secret: string): Promise<Response> {
  const parsed = revealSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return json({ error: 'Requisição inválida' }, 400);
  }

  const payload = await verifyRoundToken(parsed.data.token, secret);

  if (!payload) {
    return json({ error: 'Token inválido ou expirado' }, 401);
  }

  const vehicle = VEHICLES.find((entry) => entry.slug === payload.slug);

  if (!vehicle) {
    return json({ error: 'Veículo não encontrado' }, 404);
  }

  return json({
    identity: toVehicleIdentity(vehicle),
    correct: parsed.data.choiceId === null ? null : parsed.data.choiceId === vehicle.slug,
  });
}

function handleCredits(): Response {
  const credits = VEHICLES.filter((vehicle) => vehicle.image !== null)
    .map((vehicle) => ({
      vehicle: describeVehicle(vehicle),
      author: vehicle.image?.author ?? null,
      license: vehicle.image?.license ?? null,
      sourceUrl: vehicle.image?.sourceUrl ?? null,
    }))
    .toSorted((a, b) => a.vehicle.localeCompare(b.vehicle));

  return json({ credits });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (!pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const secret = env.ROUND_TOKEN_SECRET;

    if (!secret) {
      return json({ error: 'ROUND_TOKEN_SECRET não configurado' }, 500);
    }

    if (pathname === '/api/health') {
      return json({ ok: true, vehicleCount: VEHICLES.length });
    }

    if (pathname === '/api/credits') {
      return handleCredits();
    }

    if (request.method !== 'POST') {
      return json({ error: 'Método não permitido' }, 405);
    }

    if (pathname === '/api/round') {
      return handleRound(request, secret);
    }

    if (pathname === '/api/reveal') {
      return handleReveal(request, secret);
    }

    return json({ error: 'Rota não encontrada' }, 404);
  },
};
