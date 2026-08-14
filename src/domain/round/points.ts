import type { Outcome } from './round.types';

export function pointsForRemainingClues(revealedCount: number, totalCount: number): number {
  const total = Math.max(0, Math.floor(totalCount));
  const revealed = Math.max(0, Math.min(Math.floor(revealedCount), total));

  return Math.max(1, total - revealed);
}

export function earnedPoints(outcome: Outcome, revealedCount: number, totalCount: number): number {
  return outcome === 'correct' ? pointsForRemainingClues(revealedCount, totalCount) : 0;
}
