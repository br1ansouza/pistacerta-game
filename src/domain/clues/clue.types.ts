import type { SafeVehicle } from '../vehicle/safe-vehicle.ts';

export type ClueGroup = 'initial' | 'progressive';

export type ClueKey =
  | 'year'
  | 'price'
  | 'fuel'
  | 'displacement'
  | 'power'
  | 'origin'
  | 'torque'
  | 'aspiration'
  | 'transmission'
  | 'drivetrain'
  | 'bodyType'
  | 'valves'
  | 'cylinders'
  | 'doors'
  | 'engineCode'
  | 'axles'
  | 'gvwr'
  | 'gcwr'
  | 'cabin';

export type ClueDefinition<V = SafeVehicle> = {
  key: ClueKey;
  label: string;
  group: ClueGroup;
  resolve: (vehicle: V) => string | null;
};

export type ResolvedClue = {
  key: ClueKey;
  label: string;
  group: ClueGroup;
  value: string;
};
