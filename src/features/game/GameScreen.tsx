import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from '@untitledui/icons';
import { hasMoreClues, visibleClues } from '@/domain/clues/clue-engine';
import type { GameMode } from '@/domain/round/round.types';
import { AnswerControls } from './AnswerControls';
import { AnswerRevealBar } from './AnswerRevealBar';
import { AnswerSheet } from './AnswerSheet';
import { CluePages } from './CluePages';
import { ScoreBoard } from './ScoreBoard';
import { useScore } from './useScore';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';
import { useGameRound } from './useGameRound';
import { VehicleReveal } from './VehicleReveal';

type GameScreenProps = {
  mode: GameMode;
  kind: VehicleKind;
  onBackHome: () => void;
};

export function GameScreen({ mode, kind, onBackHome }: GameScreenProps) {
  const { state, beginRound, revealNextClue, selectChoice, submitChoice, selfReport } =
    useGameRound(mode, kind);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { score, record, reset } = useScore(mode);
  const scoredToken = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== 'revealed') {
      return;
    }

    if (scoredToken.current === state.round.token) {
      return;
    }

    scoredToken.current = state.round.token;
    record(state.outcome);
  }, [state, record]);

  const playing = state.status === 'playing' || state.status === 'revealing';

  function startNextRound() {
    setSheetOpen(false);
    void beginRound();
  }

  const revealed = playing ? state.round.revealedCount : 0;
  const total = playing ? state.round.board.progressive.length : 0;
  const pageSize = mode === 'solo' ? 12 : 10;
  const shown = playing ? visibleClues(state.round.board, revealed) : [];
  const freshKey = revealed > 0 ? (shown.at(-1)?.key ?? null) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 py-6 lg:max-w-2xl">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Voltar para a escolha de modo"
          className="border-ink-700 text-chalk-500 hover:text-flame-400 hover:border-flame-500 focus-visible:outline-flame-500 shadow-hard-sm flex size-9 shrink-0 items-center justify-center border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" />
        </button>

        <h1 className="font-display text-chalk-100 flex-1 text-center text-base font-bold tracking-tight">
          Qual <span className="text-flame-500">é?</span>
          <span className="text-chalk-500 ml-2 text-[0.6rem] tracking-[0.16em] uppercase">
            {mode === 'solo' ? 'Sozinho' : 'Dupla'}
          </span>
        </h1>

        <ScoreBoard score={score} onReset={reset} />
      </header>

      {(state.status === 'loading' || state.status === 'idle') && (
        <motion.p
          role="status"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="text-chalk-500 py-10 text-center text-sm"
        >
          Sorteando um automóvel…
        </motion.p>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col gap-4">
          <p role="alert" className="text-sm text-red-300">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => void beginRound()}
            className="border-ink-700 text-chalk-100 hover:border-flame-500 shadow-hard-sm border-2 px-5 py-3 text-sm font-semibold transition"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-5"
        >
          {state.round.identity && <AnswerRevealBar identity={state.round.identity} />}

          <div aria-live="polite">
            <CluePages clues={shown} pageSize={pageSize} freshKey={freshKey} />
          </div>

          <div className="flex items-center gap-3">
            <div className="border-ink-700 bg-ink-900 h-3 flex-1 overflow-hidden border-2">
              <motion.div
                className="from-flame-600 to-flame-400 h-full bg-gradient-to-r"
                animate={{ width: total > 0 ? `${(revealed / total) * 100}%` : '0%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
            </div>
            <span className="text-chalk-500 font-display text-[0.65rem] tabular-nums">
              {revealed}/{total}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {hasMoreClues(state.round.board, revealed) ? (
              <motion.button
                type="button"
                onClick={revealNextClue}
                whileTap={{ scale: 0.98 }}
                className="border-chalk-500/40 bg-ink-900 text-chalk-100 hover:border-flame-500 hover:text-flame-400 focus-visible:outline-flame-500 font-display shadow-hard border-2 px-5 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Próxima pista
              </motion.button>
            ) : (
              <p className="text-chalk-500 py-2 text-center text-xs">Acabaram as pistas.</p>
            )}

            {state.round.choices ? (
              <motion.button
                type="button"
                onClick={() => setSheetOpen(true)}
                whileTap={{ scale: 0.98 }}
                className="from-flame-600 to-flame-400 text-ink-950 font-display border-flame-400 shadow-hard focus-visible:outline-flame-400 border-2 bg-gradient-to-r px-5 py-4 text-sm font-bold tracking-[0.15em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Responder
              </motion.button>
            ) : (
              <AnswerControls
                onAnswer={(outcome) => void selfReport(outcome)}
                disabled={state.status === 'revealing'}
              />
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
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
      </AnimatePresence>

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
