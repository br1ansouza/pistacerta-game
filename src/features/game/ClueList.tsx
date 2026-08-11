import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedClue } from '@/domain/clues/clue.types';

type ClueListProps = {
  clues: ResolvedClue[];
  highlightFrom?: number;
};

export function ClueList({ clues, highlightFrom = -1 }: ClueListProps) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
      <AnimatePresence initial={false}>
        {clues.map((clue, index) => {
          const fresh = highlightFrom >= 0 && index >= highlightFrom;

          return (
            <motion.div
              key={clue.key}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
              className={
                fresh
                  ? 'border-flame-500 relative border-l-[3px] pl-3'
                  : 'border-ink-700 relative border-l-[3px] pl-3'
              }
            >
              <dt className="text-chalk-500 font-display text-[0.6rem] leading-tight tracking-[0.14em] uppercase">
                {clue.label}
              </dt>
              <dd
                className={
                  fresh
                    ? 'text-flame-400 font-display text-base leading-tight font-bold tabular-nums'
                    : 'text-chalk-100 font-display text-base leading-tight font-bold tabular-nums'
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
