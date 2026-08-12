import { z } from 'zod';
import { buildChoices } from '@/domain/round/choices';
import { pickFromDeck } from '@/domain/round/deck';
import { describeVehicle, toSafeVehicle, toVehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import { VEHICLES } from '@/generated/vehicles';
import { readDeckToken, signDeckToken, signRoundToken, verifyRoundToken } from './round-token';

type RateLimiter = { limit: (options: { key: string }) => Promise<{ success: boolean }> };

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  ROUND_TOKEN_SECRET?: string;
  ALLOWED_COUNTRIES?: string;
  ROUND_LIMIT?: RateLimiter;
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

const DEFAULT_COUNTRIES = 'BR';

const BLOCK_PAGE = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PistaCerta</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#12101a;color:#e8e6f0;
       font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center;padding:2rem}
  h1{font-size:1rem;letter-spacing:.08em;margin:0 0 .75rem}
  p{font-size:.75rem;color:#8e89a6;margin:0;max-width:26rem;line-height:1.6}
</style></head>
<body><div><h1>PISTACERTA</h1>
<p>Este jogo só atende acessos do Brasil.</p></div></body></html>`;

function requestCountry(request: Request): string | null {
  return (request as { cf?: { country?: string } }).cf?.country ?? null;
}

function countryAllowed(request: Request, env: Env): boolean {
  const country = requestCountry(request);

  if (!country) {
    return true;
  }

  return (env.ALLOWED_COUNTRIES ?? DEFAULT_COUNTRIES)
    .split(',')
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean)
    .includes(country.toUpperCase());
}

function blocked(pathname: string): Response {
  if (pathname.startsWith('/api/')) {
    return json({ error: 'Acesso permitido apenas do Brasil' }, 403);
  }

  return new Response(BLOCK_PAGE, {
    status: 403,
    headers: { 'content-type': 'text/html; charset=utf-8', ...NO_STORE },
  });
}

async function withinRateLimit(request: Request, env: Env): Promise<boolean> {
  const limiter = env.ROUND_LIMIT;

  if (!limiter) {
    return true;
  }

  const key = request.headers.get('cf-connecting-ip') ?? 'sem-ip';
  const { success } = await limiter.limit({ key });

  return success;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (!countryAllowed(request, env)) {
      return blocked(pathname);
    }

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

    if (!(await withinRateLimit(request, env))) {
      return json({ error: 'Muitas rodadas seguidas. Espere um pouco.' }, 429);
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
