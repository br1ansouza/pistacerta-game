import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initialRoundState, roundReducer } from '@/domain/round/round.reducer';
import type { GameMode, Outcome } from '@/domain/round/round.types';
import { revealVehicle, startRound } from '@/lib/api';
import { readDeck, saveDeck } from '@/lib/deck-storage';

export function useGameRound(mode: GameMode) {
  const [state, dispatch] = useReducer(roundReducer, initialRoundState);
  const abortRef = useRef<AbortController | null>(null);

  const beginRound = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'round/requested', mode });

    try {
      const response = await startRound(mode, readDeck(), controller.signal);
      saveDeck(response.deck);

      dispatch({
        type: 'round/started',
        token: response.token,
        mode: response.mode,
        vehicle: response.clues,
        identity: response.identity,
        choices: response.choices,
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

  const selectChoice = useCallback((choiceId: string) => {
    dispatch({ type: 'choice/selected', choiceId });
  }, []);

  const requestReveal = useCallback(async (token: string, choiceId: string | null) => {
    try {
      const response = await revealVehicle(token, choiceId);

      dispatch({
        type: 'reveal/received',
        identity: response.identity,
        outcome: response.correct === false ? 'incorrect' : 'correct',
      });
    } catch (error) {
      dispatch({
        type: 'reveal/failed',
        message: error instanceof Error ? error.message : 'Não foi possível revelar o veículo.',
      });
    }
  }, []);

  const submitChoice = useCallback(async () => {
    if (state.status !== 'playing' || !state.round.selectedChoiceId) {
      return;
    }

    const { token, selectedChoiceId } = state.round;
    dispatch({ type: 'answer/submitted' });

    await requestReveal(token, selectedChoiceId);
  }, [state, requestReveal]);

  const selfReport = useCallback(
    async (outcome: Outcome) => {
      if (state.status !== 'playing') {
        return;
      }

      const { token, identity } = state.round;
      dispatch({ type: 'answer/selfReported', outcome });

      if (identity) {
        return;
      }

      await requestReveal(token, null);
    },
    [state, requestReveal],
  );

  return { state, beginRound, revealNextClue, selectChoice, submitChoice, selfReport };
}
