import { listVehicleFiles } from './_lib/content.ts';

export async function handleHealth(_request: Request): Promise<Response> {
  const vehicleFiles = await listVehicleFiles();

  return Response.json(
    {
      ok: true,
      vehicleCount: vehicleFiles.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
