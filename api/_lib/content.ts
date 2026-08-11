import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const CARS_DIR = join(process.cwd(), 'content', 'vehicles', 'cars');

export async function listVehicleFiles(): Promise<string[]> {
  try {
    const entries = await readdir(CARS_DIR);
    return entries.filter((entry) => entry.endsWith('.json'));
  } catch {
    return [];
  }
}
