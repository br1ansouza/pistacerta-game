import { z } from 'zod';
import { toVehicleIdentity } from '../src/domain/vehicle/safe-vehicle.ts';
import { getVehicleBySlug } from '../src/domain/vehicle/vehicle.repository.ts';
import { errorResponse, jsonResponse, readJsonBody } from './_lib/http.ts';
import { verifyRoundToken } from './_lib/round-token.ts';

const requestSchema = z.object({
  token: z.string().min(1),
});

export async function handleReveal(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Método não permitido', 405);
  }

  const body = await readJsonBody<unknown>(request);
  const parsed = requestSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return errorResponse('Requisição inválida', 400);
  }

  const payload = await verifyRoundToken(parsed.data.token);

  if (!payload) {
    return errorResponse('Token inválido ou expirado', 401);
  }

  const vehicle = await getVehicleBySlug(payload.slug);

  if (!vehicle) {
    return errorResponse('Veículo não encontrado', 404);
  }

  return jsonResponse({ identity: toVehicleIdentity(vehicle) });
}
