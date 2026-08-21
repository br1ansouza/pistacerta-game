import type { SafeMotorcycle } from '../vehicle/safe-vehicle.ts';
import { capitalize, formatCurrency, formatDecimal, formatReferenceMonth } from './format.ts';
import type { ClueDefinition } from './clue.types.ts';

function formatStyle(style: SafeMotorcycle['style']): string {
  if (style === 'big trail') return 'Big trail';
  if (style === 'café racer') return 'Café racer';
  if (style === 'speed') return 'Speed (esportiva)';
  return capitalize(style);
}

export const MOTORCYCLE_CLUE_DEFINITIONS: ClueDefinition<SafeMotorcycle>[] = [
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
    key: 'power',
    label: 'Potência',
    group: 'initial',
    resolve: (vehicle) =>
      vehicle.power ? `${formatDecimal(vehicle.power.value)} ${vehicle.power.unit}` : null,
  },
  {
    key: 'style',
    label: 'Estilo',
    group: 'initial',
    help: 'Ex.: custom, café racer, big trail, speed, naked, clássica, trail ou urbana.',
    resolve: (vehicle) => formatStyle(vehicle.style),
  },
  {
    key: 'fuel',
    label: 'Combustível',
    group: 'initial',
    resolve: (vehicle) => (vehicle.fuel ? capitalize(vehicle.fuel) : null),
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
    key: 'engineCycle',
    label: 'Ciclo do motor',
    group: 'progressive',
    resolve: (vehicle) => capitalize(vehicle.engineCycle),
  },
  {
    key: 'cylinders',
    label: 'Cilindros',
    group: 'progressive',
    resolve: (vehicle) => {
      if (!vehicle.cylinders) return null;
      if (vehicle.cylinders === 1) return '1 cilindro';
      if (vehicle.cylinderLayout === 'V' || vehicle.cylinderLayout === 'W') {
        return `${vehicle.cylinderLayout}${vehicle.cylinders}`;
      }
      if (vehicle.cylinderLayout === 'boxer') return `${vehicle.cylinders} boxer`;
      return vehicle.cylinderLayout
        ? `${vehicle.cylinders} ${vehicle.cylinderLayout}`
        : String(vehicle.cylinders);
    },
  },
  {
    key: 'valves',
    label: 'Válvulas',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.valves ? `${vehicle.valves}V` : null),
  },
  {
    key: 'cooling',
    label: 'Refrigeração',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.cooling ? capitalize(vehicle.cooling) : null),
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
    key: 'finalDrive',
    label: 'Transmissão final',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.finalDrive ? capitalize(vehicle.finalDrive) : null),
  },
  {
    key: 'weight',
    label: 'Peso',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.weight
        ? `${formatDecimal(vehicle.weight.value)} ${vehicle.weight.unit}${
            vehicle.weightCondition ? ` · ${vehicle.weightCondition}` : ''
          }`
        : null,
  },
  {
    key: 'seatHeight',
    label: 'Altura do assento',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.seatHeight
        ? `${formatDecimal(vehicle.seatHeight.value)} ${vehicle.seatHeight.unit}`
        : null,
  },
  {
    key: 'abs',
    label: 'Freios ABS',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.abs === undefined ? null : vehicle.abs ? 'Sim' : 'Não'),
  },
  {
    key: 'displacement',
    label: 'Cilindrada',
    group: 'progressive',
    resolve: (vehicle) =>
      `${vehicle.displacement.value.toLocaleString('pt-BR')} ${vehicle.displacement.unit}`,
  },
  {
    key: 'engineCode',
    label: 'Motor',
    group: 'progressive',
    resolve: (vehicle) => vehicle.engineCode ?? null,
  },
];
