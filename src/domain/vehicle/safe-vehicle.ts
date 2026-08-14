import type { Car, Truck, Vehicle } from './vehicle.schema.ts';

const SHARED_FIELDS = [
  'kind',
  'year',
  'origin',
  'fipe',
  'fuel',
  'displacement',
  'power',
  'torque',
  'aspiration',
  'transmission',
  'engineCode',
  'cylinders',
  'cylinderLayout',
  'valves',
] as const;

const CAR_ONLY_FIELDS = ['drivetrain', 'bodyType', 'doors'] as const;
const TRUCK_ONLY_FIELDS = ['axleConfigs', 'cabins', 'gvwr', 'gcwr'] as const;

export const CAR_CLUE_FIELDS = [
  ...SHARED_FIELDS,
  ...CAR_ONLY_FIELDS,
] as const satisfies readonly (keyof Car)[];

export const TRUCK_CLUE_FIELDS = [
  ...SHARED_FIELDS,
  ...TRUCK_ONLY_FIELDS,
] as const satisfies readonly (keyof Truck)[];

export const CLUE_FIELDS_BY_KIND = {
  car: CAR_CLUE_FIELDS,
  truck: TRUCK_CLUE_FIELDS,
} as const;

export type SafeCar = Pick<Car, (typeof CAR_CLUE_FIELDS)[number]>;
export type SafeTruck = Pick<Truck, (typeof TRUCK_CLUE_FIELDS)[number]>;
export type SafeVehicle = SafeCar | SafeTruck;

export type VehicleIdentity = {
  brand: string;
  model: string;
  version: string | null;
  generation: string | null;
  story: string | null;
  year: number;
  image: Vehicle['image'];
};

export function toSafeVehicle(vehicle: Vehicle): SafeVehicle {
  const safe: Record<string, unknown> = {};

  for (const field of CLUE_FIELDS_BY_KIND[vehicle.kind]) {
    const value = (vehicle as Record<string, unknown>)[field];

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
    story: vehicle.story ?? null,
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
