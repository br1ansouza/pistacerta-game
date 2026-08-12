import { AnimatePresence, motion } from 'motion/react';
import { Car01, Truck01 } from '@untitledui/icons';
import { asset } from '@/lib/asset';
import type { GameMode } from '@/domain/round/round.types';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';

const APP_VERSION = process.env.PUBLIC_APP_VERSION ?? '';

type HomeScreenProps = {
  kind: VehicleKind;
  onToggleKind: () => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenCredits: () => void;
};

const KIND_COPY: Record<
  VehicleKind,
  { noun: string; tagline: string; solo: string; duo: string; next: string }
> = {
  car: {
    noun: 'carro',
    tagline: 'Doze pistas. Um carro. Descubra antes que elas acabem.',
    solo: 'Quatro alternativas no fim. O carro só aparece quando você responde.',
    duo: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    next: 'Trocar para caminhões',
  },
  truck: {
    noun: 'caminhão',
    tagline: 'Doze pistas. Um caminhão. Descubra antes que elas acabem.',
    solo: 'Quatro alternativas no fim. O caminhão só aparece quando você responde.',
    duo: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    next: 'Trocar para carros',
  },
};

const MODES: { mode: GameMode; title: string; accent: string }[] = [
  { mode: 'solo', title: 'Sozinho', accent: 'text-flame-400' },
  { mode: 'duo', title: 'Em dupla', accent: 'text-sky-400' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
};

export function HomeScreen({ kind, onToggleKind, onSelectMode, onOpenCredits }: HomeScreenProps) {
  const copy = KIND_COPY[kind];
  const NextIcon = kind === 'car' ? Truck01 : Car01;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-9 px-5 py-10">
      <motion.button
        type="button"
        onClick={onToggleKind}
        aria-label={copy.next}
        title={copy.next}
        whileTap={{ scale: 0.88, rotate: -12 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        className="border-ink-700 text-chalk-500 hover:text-flame-400 hover:border-flame-500 focus-visible:outline-flame-500 shadow-hard-sm absolute top-6 right-5 flex size-10 items-center justify-center overflow-hidden border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={kind}
            initial={{ y: 18, opacity: 0, rotate: 20 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -18, opacity: 0, rotate: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <NextIcon className="size-5" />
          </motion.span>
        </AnimatePresence>
      </motion.button>

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
            className="relative flex h-44 items-center justify-center"
          >
            <motion.div
              key={`brilho-${kind}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-t to-transparent blur-2xl ${
                kind === 'truck' ? 'from-emerald-500/25' : 'from-flame-600/25'
              }`}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={kind}
                src={asset(kind === 'truck' ? 'truck.gif' : 'car.gif')}
                alt=""
                aria-hidden
                initial={{ x: 120, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -120, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className={`pixelated object-contain ${kind === 'truck' ? 'h-44 w-44' : 'h-36 w-36'} ${
                  kind === 'truck'
                    ? 'drop-shadow-[0_10px_24px_rgba(16,185,129,0.35)]'
                    : 'drop-shadow-[0_10px_24px_rgba(232,69,44,0.35)]'
                }`}
              />
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-chalk-100 text-4xl font-bold tracking-tight">
              Pista<span className="text-flame-500">Certa</span>
            </h1>
            <div className="via-flame-500/70 h-px w-24 bg-gradient-to-r from-transparent to-transparent" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={kind}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="text-chalk-300 text-sm text-balance"
              >
                {copy.tagline}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.header>

        <section className="flex flex-col gap-3">
          {MODES.map(({ mode, title, accent }) => (
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
                  <span className="text-chalk-300 text-sm">
                    {mode === 'solo' ? copy.solo : copy.duo}
                  </span>
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

        <motion.div variants={item} className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onOpenCredits}
            className="text-chalk-500 hover:text-chalk-300 focus-visible:outline-flame-500 text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Créditos das imagens
          </button>

          <p className="font-display text-chalk-500/60 text-[0.625rem] tracking-[0.18em]">
            Versão {APP_VERSION}
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
