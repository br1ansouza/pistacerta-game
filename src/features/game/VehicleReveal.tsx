import { motion } from 'motion/react';
import type { ResolvedClue } from '@/domain/clues/clue.types';
import type { Outcome } from '@/domain/round/round.types';
import { describeIdentity, type VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import { CluePages } from './CluePages';
import { VehicleImage } from './VehicleImage';

type VehicleRevealProps = {
  identity: VehicleIdentity;
  outcome: Outcome;
  clues: ResolvedClue[];
  onNextRound: () => void;
  onBackHome: () => void;
};

export function VehicleReveal({
  identity,
  outcome,
  clues,
  onNextRound,
  onBackHome,
}: VehicleRevealProps) {
  const correct = outcome === 'correct';

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="flex flex-1 flex-col justify-center gap-5"
    >
      <header className="flex flex-col gap-2">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.08 }}
          className={
            correct
              ? 'border-mint-400 bg-mint-400/15 text-mint-400 font-display shadow-hard-sm self-start border-2 px-3 py-1 text-[0.65rem] font-bold tracking-[0.18em] uppercase'
              : 'border-chalk-500/40 bg-ink-900 text-chalk-500 font-display shadow-hard-sm self-start border-2 px-3 py-1 text-[0.65rem] font-bold tracking-[0.18em] uppercase'
          }
        >
          {correct ? 'Acertou' : 'Era esse'}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="font-display text-chalk-100 text-2xl font-bold tracking-tight"
        >
          {describeIdentity(identity)}
        </motion.h2>

        {identity.generation && <p className="text-chalk-500 text-xs">{identity.generation}</p>}
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.18, type: 'spring', stiffness: 340, damping: 30 }}
      >
        <VehicleImage identity={identity} />
      </motion.div>

      <CluePages clues={clues} pageSize={12} freshKey={null} />

      {identity.story && (
        <aside className="border-flame-500/60 bg-flame-500/10 shadow-hard-sm border-2 px-4 py-3">
          <p className="text-flame-400 font-display text-[0.6rem] font-bold tracking-[0.16em] uppercase">
            Fora de série brasileiro
          </p>
          <p className="text-chalk-300 mt-1 text-xs leading-relaxed">{identity.story}</p>
        </aside>
      )}

      <div className="flex flex-col gap-2">
        <motion.button
          type="button"
          onClick={onNextRound}
          whileTap={{ scale: 0.98 }}
          className="from-flame-600 to-flame-400 text-ink-950 font-display border-flame-400 shadow-hard focus-visible:outline-flame-400 border-2 bg-gradient-to-r px-5 py-4 text-sm font-bold tracking-[0.15em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Próxima rodada
        </motion.button>
        <button
          type="button"
          onClick={onBackHome}
          className="text-chalk-500 hover:text-chalk-300 focus-visible:outline-flame-500 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Trocar de modo
        </button>
      </div>
    </motion.div>
  );
}
