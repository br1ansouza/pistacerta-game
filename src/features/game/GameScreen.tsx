import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from '@untitledui/icons';
import { hasMoreClues, visibleClues } from '@/domain/clues/clue-engine';
import type { GameMode } from '@/domain/round/round.types';
import { AnswerControls } from './AnswerControls';
import { AnswerRevealBar } from './AnswerRevealBar';
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

  const revealed = playing ? state.round.revealedCount : 0;
  const total = playing ? state.round.board.progressive.length : 0;

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

        <h1 className="font-display text-chalk-100 text-base font-bold tracking-tight">
          Qual <span className="text-flame-500">é?</span>
        </h1>

        <span className="text-chalk-500 font-display shrink-0 text-[0.65rem] font-bold tracking-[0.18em] uppercase">
          {mode === 'solo' ? 'Sozinho' : 'Dupla'}
        </span>
      </header>

      {(state.status === 'loading' || state.status === 'idle') && (
        <motion.p
          role="status"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="text-chalk-500 py-10 text-center text-sm"
        >
          Sorteando um carro…
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
            <ClueList
              clues={visibleClues(state.round.board, revealed)}
              highlightFrom={state.round.board.initial.length + revealed - 1}
            />
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
                whileHover={{ x: 2, y: 2 }}
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
                whileHover={{ x: 2, y: 2 }}
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

            <ExtraInfoPanel vehicle={state.round.vehicle} />
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
