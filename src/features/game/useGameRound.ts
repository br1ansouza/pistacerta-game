import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initialRoundState, roundReducer } from '@/domain/round/round.reducer';
import type { GameMode, Outcome } from '@/domain/round/round.types';
import { revealVehicle, startRound } from '@/lib/api';
import { readRecentTokens, rememberToken } from '@/lib/recent-rounds';

export function useGameRound(mode: GameMode) {
  const [state, dispatch] = useReducer(roundReducer, initialRoundState);
  const abortRef = useRef<AbortController | null>(null);

  const beginRound = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'round/requested', mode });

    try {
      const response = await startRound(mode, readRecentTokens(), controller.signal);
      rememberToken(response.token);

      dispatch({
        type: 'round/started',
        token: response.token,
        mode: response.mode,
        vehicle: response.clues,
        identity: response.identity,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      dispatch({
        type: 'round/failed',
        mode,
        message: error instanceof Error ? error.message : 'Não foi possível iniciar a rodada.',
      });
    }
  }, [mode]);

  useEffect(() => {
    void beginRound();

    return () => abortRef.current?.abort();
  }, [beginRound]);

  const revealNextClue = useCallback(() => {
    dispatch({ type: 'clue/revealed' });
  }, []);

  const answer = useCallback(
    async (outcome: Outcome) => {
      if (state.status !== 'playing') {
        return;
      }

      const { token, identity } = state.round;
      dispatch({ type: 'answer/given', outcome });

      if (identity) {
        return;
      }

      try {
        const response = await revealVehicle(token);
        dispatch({ type: 'reveal/received', identity: response.identity });
      } catch (error) {
        dispatch({
          type: 'reveal/failed',
          message: error instanceof Error ? error.message : 'Não foi possível revelar o veículo.',
        });
      }
    },
    [state],
  );

  return { state, beginRound, revealNextClue, answer };
}
