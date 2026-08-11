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
        whileHover={{ x: 2, y: 2 }}
        className="border-mint-400 bg-mint-400/10 text-mint-400 font-display shadow-hard focus-visible:outline-mint-400 border-2 px-4 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Acertei
      </motion.button>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer('incorrect')}
        whileTap={{ scale: 0.97 }}
        whileHover={{ x: 2, y: 2 }}
        className="border-chalk-500/40 bg-ink-900 text-chalk-300 font-display shadow-hard focus-visible:outline-flame-500 border-2 px-4 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Errei
      </motion.button>
    </div>
  );
}
