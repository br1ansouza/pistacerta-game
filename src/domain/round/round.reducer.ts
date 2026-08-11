import { buildClueBoard, hasMoreClues } from '../clues/clue-engine.ts';
import type { RoundAction, RoundState } from './round.types.ts';

export const initialRoundState: RoundState = { status: 'idle' };

export function roundReducer(state: RoundState, action: RoundAction): RoundState {
  switch (action.type) {
    case 'round/requested':
      return { status: 'loading', mode: action.mode };

    case 'round/started':
      return {
        status: 'playing',
        round: {
          token: action.token,
          mode: action.mode,
          vehicle: action.vehicle,
          board: buildClueBoard(action.vehicle),
          revealedCount: 0,
          identity: action.identity,
        },
      };

    case 'round/failed':
      return { status: 'error', mode: action.mode, message: action.message };

    case 'clue/revealed': {
      if (state.status !== 'playing') {
        return state;
      }

      if (!hasMoreClues(state.round.board, state.round.revealedCount)) {
        return state;
      }

      return {
        ...state,
        round: { ...state.round, revealedCount: state.round.revealedCount + 1 },
      };
    }

    case 'answer/given': {
      if (state.status !== 'playing') {
        return state;
      }

      if (state.round.identity) {
        return {
          status: 'revealed',
          round: state.round,
          outcome: action.outcome,
          identity: state.round.identity,
        };
      }

      return { status: 'revealing', round: state.round, outcome: action.outcome };
    }

    case 'reveal/received': {
      if (state.status !== 'revealing') {
        return state;
      }

      return {
        status: 'revealed',
        round: { ...state.round, identity: action.identity },
        outcome: state.outcome,
        identity: action.identity,
      };
    }

    case 'reveal/failed': {
      if (state.status !== 'revealing') {
        return state;
      }

      return { status: 'error', mode: state.round.mode, message: action.message };
    }

    case 'round/reset':
      return initialRoundState;

    default:
      return state;
  }
}
