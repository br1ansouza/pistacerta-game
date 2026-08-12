import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { getPlayableVehicles } from '../src/domain/vehicle/vehicle.repository.ts';

const vehicles = await getPlayableVehicles();

if (vehicles.length === 0) {
  console.error('Nenhum veículo ativo.');
  process.exit(1);
}

const outputDir = join(process.cwd(), 'src', 'generated');
await mkdir(outputDir, { recursive: true });

await writeFile(
  join(outputDir, 'vehicles.ts'),
  `// Gerado por scripts/build-worker-content.ts — não editar à mão.
import type { Vehicle } from '@/domain/vehicle/vehicle.schema';

export const VEHICLES: Vehicle[] = ${JSON.stringify(vehicles, null, 2)} as Vehicle[];
`,
  'utf8',
);

console.log(`${vehicles.length} veículo(s) embutidos no worker.`);
