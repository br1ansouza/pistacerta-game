import { motion } from 'motion/react';
import { pointsForRemainingClues } from '@/domain/round/points';

type RoundProgressProps = {
  revealed: number;
  total: number;
};

function pointLabel(points: number): string {
  return `${points} ${points === 1 ? 'ponto' : 'pontos'}`;
}

function progressMessage(revealed: number, total: number): string {
  if (total <= 0) {
    return 'Esta rodada não possui pistas extras; o acerto vale 1 ponto.';
  }

  if (revealed >= total) {
    return 'Todas as pistas foram reveladas; o acerto ainda vale 1 ponto.';
  }

  const points = pointsForRemainingClues(revealed, total);
  const nextPoints = pointsForRemainingClues(revealed + 1, total);

  if (revealed === 0) {
    return 'Cada pista extra que sobrar vale 1 ponto; todo acerto vale ao menos 1.';
  }

  if (nextPoints < points) {
    return `A próxima pista reduz a rodada para ${pointLabel(nextPoints)}.`;
  }

  return 'A pontuação já está no mínimo de 1 ponto.';
}

export function RoundProgress({ revealed, total }: RoundProgressProps) {
  const points = pointsForRemainingClues(revealed, total);
  const percentage = total > 0 ? (revealed / total) * 100 : 0;

  return (
    <section
      aria-label="Progresso das pistas e pontos da rodada"
      className="border-ink-700 bg-ink-900/55 shadow-hard-sm flex flex-col gap-3 border-2 px-3 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-chalk-300 font-display text-[0.6rem] font-bold tracking-[0.16em] uppercase">
          Progresso das pistas
        </span>
        <motion.strong
          key={points}
          initial={{ scale: 1.16, color: 'var(--color-flame-500)' }}
          animate={{ scale: 1, color: 'var(--color-flame-400)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          className="font-display text-[0.65rem] font-bold tracking-[0.08em] uppercase tabular-nums"
        >
          Valendo {pointLabel(points)}
        </motion.strong>
      </div>

      <div className="flex items-center gap-3">
        <div className="border-ink-600 bg-ink-950 h-2.5 flex-1 overflow-hidden border-2">
          <motion.div
            className="from-flame-600 to-flame-400 h-full w-full origin-left bg-gradient-to-r"
            animate={{ scaleX: percentage / 100 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
        </div>
        <span className="text-chalk-300 font-display min-w-7 text-right text-[0.6rem] tabular-nums">
          {revealed}/{total}
        </span>
      </div>

      <p className="text-chalk-500 text-[0.68rem] leading-relaxed">
        {progressMessage(revealed, total)}
      </p>
    </section>
  );
}
