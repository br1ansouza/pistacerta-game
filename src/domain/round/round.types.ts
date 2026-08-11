import type { ClueBoard } from '../clues/clue-engine.ts';
import type { SafeVehicle, VehicleIdentity } from '../vehicle/safe-vehicle.ts';
import type { RoundChoice } from './choices.ts';

export type GameMode = 'solo' | 'duo';

export type Outcome = 'correct' | 'incorrect';

export type ActiveRound = {
  token: string;
  mode: GameMode;
  vehicle: SafeVehicle;
  board: ClueBoard;
  revealedCount: number;
  identity: VehicleIdentity | null;
  choices: RoundChoice[] | null;
  selectedChoiceId: string | null;
};

export type RoundState =
  | { status: 'idle' }
  | { status: 'loading'; mode: GameMode }
  | { status: 'playing'; round: ActiveRound }
  | { status: 'revealing'; round: ActiveRound }
  | { status: 'revealed'; round: ActiveRound; outcome: Outcome; identity: VehicleIdentity }
  | { status: 'error'; mode: GameMode; message: string };

export type RoundAction =
  | { type: 'round/requested'; mode: GameMode }
  | {
      type: 'round/started';
      token: string;
      mode: GameMode;
      vehicle: SafeVehicle;
      identity: VehicleIdentity | null;
      choices: RoundChoice[] | null;
    }
  | { type: 'round/failed'; mode: GameMode; message: string }
  | { type: 'clue/revealed' }
  | { type: 'choice/selected'; choiceId: string }
  | { type: 'answer/submitted' }
  | { type: 'answer/selfReported'; outcome: Outcome }
  | { type: 'reveal/received'; identity: VehicleIdentity; outcome: Outcome }
  | { type: 'reveal/failed'; message: string }
  | { type: 'round/reset' };
