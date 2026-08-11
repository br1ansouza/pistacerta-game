import { motion } from 'motion/react';
import { asset } from '@/lib/asset';
import type { GameMode } from '@/domain/round/round.types';

type HomeScreenProps = {
  onSelectMode: (mode: GameMode) => void;
  onOpenCredits: () => void;
};

const MODES: { mode: GameMode; title: string; description: string; accent: string }[] = [
  {
    mode: 'solo',
    title: 'Sozinho',
    description: 'Quatro alternativas no fim. O carro só aparece quando você responde.',
    accent: 'text-flame-400',
  },
  {
    mode: 'duo',
    title: 'Em dupla',
    description: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    accent: 'text-sky-400',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
};

export function HomeScreen({ onSelectMode, onOpenCredits }: HomeScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-9 px-5 py-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-9"
      >
        <motion.header variants={item} className="flex flex-col items-center gap-4 text-center">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="from-flame-600/25 absolute inset-0 -z-10 rounded-full bg-gradient-to-t to-transparent blur-2xl" />
            <img
              src={asset('car.gif')}
              alt=""
              aria-hidden
              className="pixelated h-36 w-36 object-contain drop-shadow-[0_10px_24px_rgba(232,69,44,0.35)]"
            />
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-chalk-100 text-4xl font-bold tracking-tight">
              Pista<span className="text-flame-500">Certa</span>
            </h1>
            <div className="via-flame-500/70 h-px w-24 bg-gradient-to-r from-transparent to-transparent" />
            <p className="text-chalk-300 text-sm text-balance">
              Doze pistas. Um carro. Descubra antes que elas acabem.
            </p>
          </div>
        </motion.header>

        <section className="flex flex-col gap-3">
          {MODES.map(({ mode, title, description, accent }) => (
            <motion.button
              key={mode}
              variants={item}
              type="button"
              onClick={() => onSelectMode(mode)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="group border-chalk-500/30 bg-ink-900/80 hover:border-flame-500 focus-visible:outline-flame-500 shadow-hard relative overflow-hidden border-2 px-5 py-4 text-left backdrop-blur transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="from-flame-600 to-flame-400 absolute inset-y-0 left-0 w-1 bg-gradient-to-b opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="flex items-center justify-between gap-4">
                <span className="flex flex-col gap-1">
                  <span
                    className={`font-display text-xs font-bold tracking-[0.18em] uppercase ${accent}`}
                  >
                    {title}
                  </span>
                  <span className="text-chalk-300 text-sm">{description}</span>
                </span>
                <span
                  aria-hidden
                  className="text-chalk-500 group-hover:text-flame-400 shrink-0 text-xl transition-transform group-hover:translate-x-1"
                >
                  &rsaquo;
                </span>
              </span>
            </motion.button>
          ))}
        </section>

        <motion.button
          variants={item}
          type="button"
          onClick={onOpenCredits}
          className="text-chalk-500 hover:text-chalk-300 focus-visible:outline-flame-500 self-center text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Créditos das imagens
        </motion.button>
      </motion.div>
    </main>
  );
}
