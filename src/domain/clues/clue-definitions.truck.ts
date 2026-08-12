import type { SafeTruck } from '../vehicle/safe-vehicle.ts';
import { capitalize, formatCurrency, formatDecimal, formatReferenceMonth } from './format.ts';
import type { ClueDefinition } from './clue.types.ts';

function formatWeight(kilos: number): string {
  return `${(kilos / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`;
}

export const TRUCK_CLUE_DEFINITIONS: ClueDefinition<SafeTruck>[] = [
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
    key: 'torque',
    label: 'Torque',
    group: 'initial',
    resolve: (vehicle) =>
      vehicle.torque ? `${formatDecimal(vehicle.torque.value)} ${vehicle.torque.unit}` : null,
  },
  {
    key: 'displacement',
    label: 'Cilindrada',
    group: 'initial',
    resolve: (vehicle) => (vehicle.displacement ? `${vehicle.displacement} L` : null),
  },
  {
    key: 'axles',
    label: 'Trações disponíveis',
    group: 'progressive',
    resolve: (vehicle) => vehicle.axleConfigs?.join(' · ') ?? null,
  },
  {
    key: 'origin',
    label: 'Procedência',
    group: 'progressive',
    resolve: (vehicle) =>
      vehicle.countryOfOrigin
        ? `${capitalize(vehicle.origin)} (${vehicle.countryOfOrigin})`
        : capitalize(vehicle.origin),
  },
  {
    key: 'gvwr',
    label: 'PBT',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.gvwr ? formatWeight(vehicle.gvwr) : null),
  },
  {
    key: 'gcwr',
    label: 'PBTC',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.gcwr ? formatWeight(vehicle.gcwr) : null),
  },
  {
    key: 'transmission',
    label: 'Câmbio',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.transmission ? capitalize(vehicle.transmission) : null),
  },
  {
    key: 'cylinders',
    label: 'Cilindros',
    group: 'progressive',
    resolve: (vehicle) => {
      if (!vehicle.cylinders) {
        return null;
      }

      return vehicle.cylinderLayout
        ? `${vehicle.cylinders} ${vehicle.cylinderLayout}`
        : String(vehicle.cylinders);
    },
  },
  {
    key: 'cabin',
    label: 'Cabine',
    group: 'progressive',
    resolve: (vehicle) => vehicle.cabins?.map(capitalize).join(' · ') ?? null,
  },
  {
    key: 'aspiration',
    label: 'Aspiração',
    group: 'progressive',
    resolve: (vehicle) => (vehicle.aspiration ? capitalize(vehicle.aspiration) : null),
  },
  {
    key: 'engineCode',
    label: 'Código do motor',
    group: 'progressive',
    resolve: (vehicle) => vehicle.engineCode ?? null,
  },
];
