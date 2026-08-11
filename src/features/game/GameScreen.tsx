import { Button } from '@/components/base/buttons/button';
import { hasMoreClues, visibleClues } from '@/domain/clues/clue-engine';
import type { GameMode } from '@/domain/round/round.types';
import { describeIdentity } from '@/domain/vehicle/safe-vehicle';
import { AnswerControls } from './AnswerControls';
import { ClueList } from './ClueList';
import { ExtraInfoPanel } from './ExtraInfoPanel';
import { useGameRound } from './useGameRound';
import { VehicleReveal } from './VehicleReveal';

type GameScreenProps = {
  mode: GameMode;
  onBackHome: () => void;
};

export function GameScreen({ mode, onBackHome }: GameScreenProps) {
  const { state, beginRound, revealNextClue, answer } = useGameRound(mode);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-primary text-lg font-bold">Qual é?</h1>
        <span className="text-quaternary text-xs font-medium tracking-widest uppercase">
          {mode === 'solo' ? 'Sozinho' : 'Em dupla'}
        </span>
      </header>

      {(state.status === 'loading' || state.status === 'idle') && (
        <p className="text-tertiary text-sm">Sorteando um carro…</p>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col gap-4">
          <p className="text-error-primary text-sm">{state.message}</p>
          <Button size="lg" color="secondary" onClick={() => void beginRound()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {(state.status === 'playing' || state.status === 'revealing') && (
        <div className="flex flex-col gap-6">
          {state.round.identity && (
            <p className="border-brand bg-brand-primary text-brand-secondary rounded-xl border px-4 py-3 text-sm">
              Resposta: <strong>{describeIdentity(state.round.identity)}</strong>
            </p>
          )}

          <section className="border-secondary bg-secondary rounded-2xl border px-5 py-3">
            <ClueList
              clues={visibleClues(state.round.board, state.round.revealedCount)}
              initialCount={state.round.board.initial.length}
            />
          </section>

          <div className="flex flex-col gap-4">
            {hasMoreClues(state.round.board, state.round.revealedCount) ? (
              <Button size="lg" color="secondary" onClick={revealNextClue}>
                Próxima pista
              </Button>
            ) : (
              <p className="text-quaternary text-center text-sm">Acabaram as pistas.</p>
            )}

            <ExtraInfoPanel vehicle={state.round.vehicle} />

            <AnswerControls
              onAnswer={(outcome) => void answer(outcome)}
              disabled={state.status === 'revealing'}
            />
          </div>
        </div>
      )}

      {state.status === 'revealed' && (
        <VehicleReveal
          identity={state.identity}
          outcome={state.outcome}
          clues={visibleClues(state.round.board, state.round.board.progressive.length)}
          onNextRound={() => void beginRound()}
          onBackHome={onBackHome}
        />
      )}
    </main>
  );
}
