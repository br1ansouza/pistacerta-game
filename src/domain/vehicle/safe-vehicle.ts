import type { Vehicle } from './vehicle.schema.ts';

export const CLUE_FIELDS = [
  'kind',
  'year',
  'origin',
  'countryOfOrigin',
  'fipe',
  'fuel',
  'displacement',
  'power',
  'torque',
  'aspiration',
  'transmission',
  'drivetrain',
  'bodyType',
  'engineCode',
  'cylinders',
  'cylinderLayout',
  'valves',
  'doors',
] as const satisfies readonly (keyof Vehicle)[];

export type ClueField = (typeof CLUE_FIELDS)[number];

export type SafeVehicle = Pick<Vehicle, ClueField>;

export type VehicleIdentity = {
  brand: string;
  model: string;
  version: string | null;
  generation: string | null;
  year: number;
  image: Vehicle['image'];
};

export function toSafeVehicle(vehicle: Vehicle): SafeVehicle {
  const safe: Partial<Record<ClueField, unknown>> = {};

  for (const field of CLUE_FIELDS) {
    const value = vehicle[field];

    if (value !== undefined) {
      safe[field] = value;
    }
  }

  return safe as SafeVehicle;
}

export function toVehicleIdentity(vehicle: Vehicle): VehicleIdentity {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version ?? null,
    generation: vehicle.generation ?? null,
    year: vehicle.year,
    image: vehicle.image,
  };
}

export function describeVehicle(vehicle: Vehicle): string {
  return [vehicle.brand, vehicle.model, vehicle.version, vehicle.year].filter(Boolean).join(' ');
}

export function describeIdentity(identity: VehicleIdentity): string {
  return [identity.brand, identity.model, identity.version, identity.year]
    .filter(Boolean)
    .join(' ');
}
