import { useState } from 'react';
import { ArrowLeft } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { hasMoreClues, visibleClues } from '@/domain/clues/clue-engine';
import type { GameMode } from '@/domain/round/round.types';
import { describeIdentity } from '@/domain/vehicle/safe-vehicle';
import { AnswerControls } from './AnswerControls';
import { AnswerSheet } from './AnswerSheet';
import { ClueList } from './ClueList';
import { ExtraInfoPanel } from './ExtraInfoPanel';
import { useGameRound } from './useGameRound';
import { VehicleReveal } from './VehicleReveal';

type GameScreenProps = {
  mode: GameMode;
  onBackHome: () => void;
};

export function GameScreen({ mode, onBackHome }: GameScreenProps) {
  const { state, beginRound, revealNextClue, selectChoice, submitChoice, selfReport } =
    useGameRound(mode);
  const [sheetOpen, setSheetOpen] = useState(false);

  const playing = state.status === 'playing' || state.status === 'revealing';

  function startNextRound() {
    setSheetOpen(false);
    void beginRound();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 py-6 lg:max-w-3xl">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Voltar para a escolha de modo"
          className="border-secondary text-tertiary hover:text-primary hover:border-primary focus-visible:outline-brand flex size-9 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" />
        </button>

        <h1 className="text-primary text-lg font-bold">Qual é?</h1>

        <span className="text-quaternary shrink-0 text-xs font-medium tracking-widest uppercase">
          {mode === 'solo' ? 'Sozinho' : 'Dupla'}
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

      {playing && (
        <div className="flex flex-col gap-5">
          {state.round.identity && (
            <p className="border-brand bg-brand-primary text-brand-secondary rounded-xl border px-4 py-3 text-sm">
              Resposta: <strong>{describeIdentity(state.round.identity)}</strong>
            </p>
          )}

          <ClueList
            clues={visibleClues(state.round.board, state.round.revealedCount)}
            highlightFrom={state.round.board.initial.length + state.round.revealedCount - 1}
          />

          <div className="flex flex-col gap-3">
            {hasMoreClues(state.round.board, state.round.revealedCount) ? (
              <Button size="lg" color="secondary" onClick={revealNextClue}>
                Próxima pista
              </Button>
            ) : (
              <p className="text-quaternary text-center text-sm">Acabaram as pistas.</p>
            )}

            {state.round.choices ? (
              <Button size="lg" color="primary" onClick={() => setSheetOpen(true)}>
                Responder
              </Button>
            ) : (
              <AnswerControls
                onAnswer={(outcome) => void selfReport(outcome)}
                disabled={state.status === 'revealing'}
              />
            )}

            <ExtraInfoPanel vehicle={state.round.vehicle} />
          </div>
        </div>
      )}

      {playing && sheetOpen && state.round.choices && (
        <AnswerSheet
          choices={state.round.choices}
          selectedId={state.round.selectedChoiceId}
          submitting={state.status === 'revealing'}
          onSelect={selectChoice}
          onConfirm={() => void submitChoice()}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {state.status === 'revealed' && (
        <VehicleReveal
          identity={state.identity}
          outcome={state.outcome}
          clues={visibleClues(state.round.board, state.round.board.progressive.length)}
          onNextRound={startNextRound}
          onBackHome={onBackHome}
        />
      )}
    </main>
  );
}
