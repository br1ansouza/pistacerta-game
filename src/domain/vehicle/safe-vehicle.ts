import { IDENTITY_FIELDS, type IdentityField, type Vehicle } from './vehicle.schema.ts';

export type SafeVehicle = Omit<Vehicle, IdentityField>;

export type VehicleIdentity = Pick<Vehicle, IdentityField>;

export function toSafeVehicle(vehicle: Vehicle): SafeVehicle {
  const safe = { ...vehicle } as Record<string, unknown>;

  for (const field of IDENTITY_FIELDS) {
    delete safe[field];
  }

  return safe as SafeVehicle;
}

export function toVehicleIdentity(vehicle: Vehicle): VehicleIdentity {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    generation: vehicle.generation,
    image: vehicle.image,
  };
}

export function describeVehicle(vehicle: Vehicle): string {
  return [vehicle.brand, vehicle.model, vehicle.version, vehicle.year].filter(Boolean).join(' ');
}
