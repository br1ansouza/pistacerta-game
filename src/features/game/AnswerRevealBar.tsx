import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { describeIdentity, type VehicleIdentity } from '@/domain/vehicle/safe-vehicle';

type AnswerRevealBarProps = {
  identity: VehicleIdentity;
};

export function AnswerRevealBar({ identity }: AnswerRevealBarProps) {
  const [shown, setShown] = useState(false);

  return (
    <div className="border-sky-400/50 bg-sky-400/5 shadow-hard-sm flex items-center justify-between gap-3 border-2 px-4 py-3">
      <div className="min-w-0">
        <p className="font-display text-sky-400 text-[0.6rem] tracking-[0.16em] uppercase">
          Resposta
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {shown ? (
            <motion.p
              key="shown"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-chalk-100 truncate text-sm font-bold"
            >
              {describeIdentity(identity)}
            </motion.p>
          ) : (
            <motion.p
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-ink-600 text-sm font-bold tracking-widest select-none"
            >
              ████ ██████
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        className="border-sky-400/60 text-sky-400 font-display hover:bg-sky-400/15 focus-visible:outline-sky-400 shrink-0 border-2 px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.14em] uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {shown ? 'Ocultar' : 'Revelar'}
      </button>
    </div>
  );
}
