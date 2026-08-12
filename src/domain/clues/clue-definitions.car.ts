import type { Car } from '../vehicle/vehicle.schema.ts';
import type { ClueDefinition } from './clue.types.ts';
import { capitalize, formatCurrency, formatDecimal, formatReferenceMonth } from './format.ts';

type SafeCar = Omit<Car, 'brand' | 'model' | 'generation' | 'image'>;

export const CAR_CLUE_DEFINITIONS: ClueDefinition<SafeCar>[] = [
  {
    key: 'year',
    label: 'Ano',
    group: 'initial',
    resolve: (vehicle) => String(vehicle.year),
  },
  {
    key: 'price',
    label: 'Preço FIPE',
    group: 'initial',
    resolve: (vehicle) =>
      vehicle.fipe
        ? `${formatCurrency(vehicle.fipe.value)} · ${formatReferenceMonth(vehicle.fipe.referenceMonth)}`
        : null,
  },
  {
    key: 'fuel',
    label: 'Combustível',
    group: 'initial',
    resolve: (vehicle) => (vehicle.fuel ? capitalize(vehicle.fuel) : null),
  },
  {
    key: 'displacement',
    label: 'Cilindrada',
    group: 'initial',
    resolve: (vehicle) => vehicle.displacement ?? null,
  },
  {
    key: 'power',
    label: 'Potência',
    group: 'initial',
    resolve: (vehicle) =>
      vehicle.power ? `${formatDecimal(vehicle.power.value)} ${vehicle.power.unit}` : null,
  },
  {
    key: 'origin',
    label: 'Procedência',
    group: 'progressive',
    resolve: (vehicle) => capitalize(vehicle.origin),
  },
  {
    key: 'torque',
    label: 'Torque',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.torque ? `${formatDecimal(vehicle.torque.value)} ${vehicle.torque.unit}` : null,
  },
  {
    key: 'aspiration',
    label: 'Aspiração',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.aspiration ? capitalize(vehicle.aspiration) : null),
  },
  {
    key: 'transmission',
    label: 'Câmbio',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.transmission
        ? vehicle.transmission === 'cvt'
          ? 'CVT'
          : capitalize(vehicle.transmission)
        : null,
  },
  {
    key: 'drivetrain',
    label: 'Tração',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.drivetrain ? capitalize(vehicle.drivetrain) : null),
  },
  {
    key: 'bodyType',
    label: 'Carroceria',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.bodyType ? (vehicle.bodyType === 'suv' ? 'SUV' : capitalize(vehicle.bodyType)) : null,
  },
  {
    key: 'cylinders',
    label: 'Cilindros',
    group: 'progressive',
    resolve: (vehicle) => {
      if (!vehicle.cylinders) {
        return null;
      }

      if (vehicle.cylinderLayout === 'V' || vehicle.cylinderLayout === 'W') {
        return `${vehicle.cylinderLayout}${vehicle.cylinders}`;
      }

      if (vehicle.cylinderLayout === 'boxer') {
        return `${vehicle.cylinders} boxer`;
      }

      return vehicle.cylinderLayout
        ? `${vehicle.cylinders} ${vehicle.cylinderLayout}`
        : String(vehicle.cylinders);
    },
  },
  {
    key: 'doors',
    label: 'Portas',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.doors ? String(vehicle.doors) : null),
  },
  {
    key: 'valves',
    label: 'Válvulas',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.valves ? `${vehicle.valves}V` : null),
  },
  {
    key: 'engineCode',
    label: 'Código do motor',
    group: 'progressive',
    resolve: (vehicle) => {
      if (!vehicle.engineCode) {
        return null;
      }

      const displacement = vehicle.displacement;

      if (!displacement || vehicle.engineCode.includes(displacement)) {
        return vehicle.engineCode;
      }

      return `${displacement} ${vehicle.engineCode}`;
    },
  },
];
