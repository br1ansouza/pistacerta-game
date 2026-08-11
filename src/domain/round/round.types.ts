import type { ClueBoard } from '../clues/clue-engine.ts';
import type { SafeVehicle, VehicleIdentity } from '../vehicle/safe-vehicle.ts';

export type GameMode = 'solo' | 'duo';

export type Outcome = 'correct' | 'incorrect';

export type ActiveRound = {
  token: string;
  mode: GameMode;
  vehicle: SafeVehicle;
  board: ClueBoard;
  revealedCount: number;
  identity: VehicleIdentity | null;
};

export type RoundState =
  | { status: 'idle' }
  | { status: 'loading'; mode: GameMode }
  | { status: 'playing'; round: ActiveRound }
  | { status: 'revealing'; round: ActiveRound; outcome: Outcome }
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
    }
  | { type: 'round/failed'; mode: GameMode; message: string }
  | { type: 'clue/revealed' }
  | { type: 'answer/given'; outcome: Outcome }
  | { type: 'reveal/received'; identity: VehicleIdentity }
  | { type: 'reveal/failed'; message: string }
  | { type: 'round/reset' };
