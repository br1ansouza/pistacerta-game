import { motion } from 'motion/react';
import type { Outcome } from '@/domain/round/round.types';

type AnswerControlsProps = {
  onAnswer: (outcome: Outcome) => void;
  disabled?: boolean;
};

export function AnswerControls({ onAnswer, disabled }: AnswerControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer('correct')}
        whileTap={{ scale: 0.97 }}
        className="border-mint-400/40 bg-mint-400/10 text-mint-400 font-display hover:border-mint-400 focus-visible:outline-mint-400 rounded-xl border px-4 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Acertei
      </motion.button>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer('incorrect')}
        whileTap={{ scale: 0.97 }}
        className="border-ink-700 bg-ink-900/70 text-chalk-300 font-display hover:border-ink-600 focus-visible:outline-flame-500 rounded-xl border px-4 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Errei
      </motion.button>
    </div>
  );
}
