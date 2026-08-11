import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';
import { describeVehicle } from '../src/domain/vehicle/safe-vehicle.ts';
import { jsonResponse } from './_lib/http.ts';

export async function handleCredits(_request: Request): Promise<Response> {
  const vehicles = await getPlayableVehicles();

  const credits = vehicles
    .filter((vehicle) => vehicle.image !== null)
    .map((vehicle) => ({
      vehicle: describeVehicle(vehicle),
      author: vehicle.image?.author ?? null,
      license: vehicle.image?.license ?? null,
      sourceUrl: vehicle.image?.sourceUrl ?? null,
    }))
    .toSorted((a, b) => a.vehicle.localeCompare(b.vehicle));

  return jsonResponse({ credits });
}
