import { useCallback, useState } from 'react';
import type { GameMode, Outcome } from '@/domain/round/round.types';

export type Score = { correct: number; incorrect: number };

const EMPTY: Score = { correct: 0, incorrect: 0 };

function storageKey(mode: GameMode): string {
  return `pistacerta:score:${mode}`;
}

function read(mode: GameMode): Score {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(mode));

    if (!raw) {
      return EMPTY;
    }

    const parsed = JSON.parse(raw) as Partial<Score>;

    return {
      correct: Number(parsed.correct) || 0,
      incorrect: Number(parsed.incorrect) || 0,
    };
  } catch {
    return EMPTY;
  }
}

function write(mode: GameMode, score: Score): void {
  try {
    globalThis.localStorage?.setItem(storageKey(mode), JSON.stringify(score));
  } catch {
    return;
  }
}

export function useScore(mode: GameMode) {
  const [score, setScore] = useState<Score>(() => read(mode));

  const record = useCallback(
    (outcome: Outcome) => {
      setScore((current) => {
        const next: Score =
          outcome === 'correct'
            ? { ...current, correct: current.correct + 1 }
            : { ...current, incorrect: current.incorrect + 1 };

        write(mode, next);
        return next;
      });
    },
    [mode],
  );

  const reset = useCallback(() => {
    setScore(EMPTY);
    write(mode, EMPTY);
  }, [mode]);

  return { score, record, reset };
}
