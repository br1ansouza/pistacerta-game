import { motion } from 'motion/react';
import type { Score } from './useScore';

type ScoreBoardProps = {
  score: Score;
  onReset: () => void;
};

export function ScoreBoard({ score, onReset }: ScoreBoardProps) {
  const total = score.correct + score.incorrect;

  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={`c-${score.correct}`}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className="border-mint-400/60 text-mint-400 font-display border-2 px-2 py-0.5 text-[0.65rem] font-bold tabular-nums"
        title="Acertos"
      >
        {score.correct}
      </motion.span>

      <motion.span
        key={`e-${score.incorrect}`}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className="border-crimson-700 text-flame-600 font-display border-2 px-2 py-0.5 text-[0.65rem] font-bold tabular-nums"
        title="Erros"
      >
        {score.incorrect}
      </motion.span>

      {total > 0 && (
        <button
          type="button"
          onClick={onReset}
          title="Zerar placar"
          aria-label="Zerar placar"
          className="text-chalk-500 hover:text-flame-400 focus-visible:outline-flame-500 px-1 text-[0.65rem] transition focus-visible:outline-2"
        >
          zerar
        </button>
      )}
    </div>
  );
}
