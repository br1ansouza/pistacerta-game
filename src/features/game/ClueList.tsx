import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedClue } from '@/domain/clues/clue.types';

type ClueListProps = {
  clues: ResolvedClue[];
  highlightFrom?: number;
};

export function ClueList({ clues, highlightFrom = -1 }: ClueListProps) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      <AnimatePresence initial={false}>
        {clues.map((clue, index) => {
          const fresh = highlightFrom >= 0 && index >= highlightFrom;

          return (
            <motion.div
              key={clue.key}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
              className={
                fresh
                  ? 'border-flame-500/70 bg-flame-500/10 relative flex flex-col gap-0.5 rounded-xl border px-3 py-2'
                  : 'border-ink-700 bg-ink-900/60 flex flex-col gap-0.5 rounded-xl border px-3 py-2'
              }
            >
              {fresh && (
                <motion.span
                  aria-hidden
                  layoutId="clue-glow"
                  className="bg-flame-500/10 pointer-events-none absolute inset-0 rounded-xl"
                />
              )}
              <dt className="text-chalk-500 font-display text-[0.65rem] tracking-wider uppercase">
                {clue.label}
              </dt>
              <dd
                className={
                  fresh
                    ? 'text-flame-400 text-sm font-bold tabular-nums'
                    : 'text-chalk-100 text-sm font-bold tabular-nums'
                }
              >
                {clue.value}
              </dd>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </dl>
  );
}
