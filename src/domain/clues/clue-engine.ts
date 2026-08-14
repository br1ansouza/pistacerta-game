import type { SafeVehicle } from '../vehicle/safe-vehicle.ts';
import type { VehicleKind } from '../vehicle/vehicle.schema.ts';
import { CAR_CLUE_DEFINITIONS } from './clue-definitions.car.ts';
import { TRUCK_CLUE_DEFINITIONS } from './clue-definitions.truck.ts';
import type { ClueDefinition, ResolvedClue } from './clue.types.ts';

const DEFINITIONS_BY_KIND: Record<VehicleKind, ClueDefinition<never>[]> = {
  car: CAR_CLUE_DEFINITIONS as ClueDefinition<never>[],
  truck: TRUCK_CLUE_DEFINITIONS as ClueDefinition<never>[],
};

export type ClueBoard = {
  initial: ResolvedClue[];
  progressive: ResolvedClue[];
};

export function buildClueBoard(vehicle: SafeVehicle): ClueBoard {
  const definitions = DEFINITIONS_BY_KIND[vehicle.kind];

  const resolved = definitions.flatMap((definition): ResolvedClue[] => {
    const value = definition.resolve(vehicle as never);

    if (value === null || value.trim() === '') {
      return [];
    }

    return [
      {
        key: definition.key,
        label: definition.label,
        group: definition.group,
        ...(definition.help ? { help: definition.help } : {}),
        value,
      },
    ];
  });

  return {
    initial: resolved.filter((clue) => clue.group === 'initial'),
    progressive: resolved.filter((clue) => clue.group === 'progressive'),
  };
}

export function countAvailableClues(board: ClueBoard): number {
  return board.initial.length + board.progressive.length;
}

export function visibleClues(board: ClueBoard, revealedCount: number): ResolvedClue[] {
  const safeCount = Math.max(0, Math.min(revealedCount, board.progressive.length));
  return [...board.initial, ...board.progressive.slice(0, safeCount)];
}

export function hasMoreClues(board: ClueBoard, revealedCount: number): boolean {
  return revealedCount < board.progressive.length;
}
