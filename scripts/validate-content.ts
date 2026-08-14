import { loadAllVehicles, VehicleContentError } from '../src/domain/vehicle/vehicle.repository.ts';
import { describeVehicle } from '../src/domain/vehicle/safe-vehicle.ts';
import type { Vehicle } from '../src/domain/vehicle/vehicle.schema.ts';

const CLUE_FIELDS = [
  'year',
  'fipe',
  'fuel',
  'displacement',
  'power',
  'origin',
  'torque',
  'aspiration',
  'transmission',
  'engineFamily',
] as const;

const MINIMUM_CLUES = 5;

function countAvailableClues(vehicle: Vehicle): number {
  const record = vehicle as unknown as Record<string, unknown>;

  return CLUE_FIELDS.filter((field) => record[field] !== undefined && record[field] !== null)
    .length;
}

function report(vehicles: Vehicle[]): number {
  const warnings: string[] = [];
  let errors = 0;

  for (const vehicle of vehicles) {
    const clueCount = countAvailableClues(vehicle);

    if (clueCount < MINIMUM_CLUES) {
      console.error(
        `✖ ${vehicle.slug}: só ${clueCount} pista(s) disponível(is), mínimo é ${MINIMUM_CLUES}.`,
      );
      errors += 1;
    }

    if (!vehicle.image) {
      if (vehicle.active) {
        console.error(`✖ ${vehicle.slug}: veículo ativo sem foto verificada.`);
        errors += 1;
      } else {
        warnings.push(`${vehicle.slug}: sem imagem (fallback será usado).`);
      }
    } else if (vehicle.image.market === 'global') {
      warnings.push(`${vehicle.slug}: foto de mercado global — ${vehicle.image.depicts}.`);
    }

    if (vehicle.kind === 'truck' && vehicle.image && !vehicle.image.src.startsWith('https://')) {
      console.error(`✖ ${vehicle.slug}: foto de caminhão deve usar uma URL HTTPS externa.`);
      errors += 1;
    }

    if (!vehicle.fipe) {
      warnings.push(`${vehicle.slug}: sem valor FIPE (pista de preço será pulada).`);
    }
  }

  const byBrand = new Map<string, number>();
  for (const vehicle of vehicles) {
    byBrand.set(vehicle.brand, (byBrand.get(vehicle.brand) ?? 0) + 1);
  }

  console.log(`\n${vehicles.length} veículo(s) válido(s).`);

  const distribution = [...byBrand.entries()]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([brand, count]) => `${brand} ${count}`)
    .join(' · ');
  console.log(`Distribuição por marca: ${distribution}`);

  const inactive = vehicles.filter((vehicle) => !vehicle.active);
  if (inactive.length > 0) {
    console.log(`Desativados: ${inactive.map((vehicle) => vehicle.slug).join(', ')}`);
  }

  if (warnings.length > 0) {
    console.log('\nAvisos:');
    for (const warning of warnings) {
      console.log(`  · ${warning}`);
    }
  }

  return errors;
}

async function main() {
  let vehicles: Vehicle[];

  try {
    vehicles = await loadAllVehicles({ fresh: true });
  } catch (error) {
    if (error instanceof VehicleContentError) {
      console.error(`✖ ${error.file}`);
      for (const issue of error.issues) {
        console.error(`    ${issue}`);
      }
      process.exit(1);
    }
    throw error;
  }

  if (vehicles.length === 0) {
    console.error('✖ Nenhum veículo encontrado em content/vehicles/.');
    process.exit(1);
  }

  const errors = report(vehicles);

  if (errors > 0) {
    console.error(`\n✖ ${errors} veículo(s) reprovado(s).`);
    process.exit(1);
  }

  console.log('\n✓ Conteúdo validado.');
  console.log(vehicles.map((vehicle) => `  · ${describeVehicle(vehicle)}`).join('\n'));
}

await main();
