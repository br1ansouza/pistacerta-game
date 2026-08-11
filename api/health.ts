import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';

export async function handleHealth(_request: Request): Promise<Response> {
  const vehicles = await getPlayableVehicles();

  return Response.json(
    {
      ok: true,
      vehicleCount: vehicles.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
