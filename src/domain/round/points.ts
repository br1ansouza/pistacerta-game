import type { Outcome } from './round.types';

export type RoundPoints = 1 | 2 | 3;

export function pointsForRevealedClues(revealedCount: number): RoundPoints {
  if (revealedCount <= 2) {
    return 3;
  }

  if (revealedCount <= 4) {
    return 2;
  }

  return 1;
}

export function earnedPoints(outcome: Outcome, revealedCount: number): number {
  return outcome === 'correct' ? pointsForRevealedClues(revealedCount) : 0;
}
