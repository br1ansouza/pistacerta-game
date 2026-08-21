import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Car01, Truck01 } from '@untitledui/icons';
import { asset } from '@/lib/asset';
import { motionSpring } from '@/lib/motion';
import type { GameMode } from '@/domain/round/round.types';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';

const APP_VERSION = process.env.PUBLIC_APP_VERSION ?? '';

type HomeScreenProps = {
  kind: VehicleKind;
  onSelectKind: (kind: VehicleKind) => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenCredits: () => void;
};

const KIND_COPY: Record<
  VehicleKind,
  { label: string; garage: string; tagline: string; solo: string; duo: string; sprite: string }
> = {
  car: {
    label: 'Carros',
    garage: 'Garagem de carros',
    tagline: 'Pistas progressivas. Um carro. Descubra antes que elas acabem.',
    solo: 'Quatro alternativas no fim. O carro só aparece quando você responde.',
    duo: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    sprite: 'car.gif',
  },
  truck: {
    label: 'Caminhões',
    garage: 'Garagem de caminhões',
    tagline: 'Pistas progressivas. Um caminhão. Descubra antes que elas acabem.',
    solo: 'Quatro alternativas no fim. O caminhão só aparece quando você responde.',
    duo: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    sprite: 'truck.gif',
  },
  motorcycle: {
    label: 'Motos',
    garage: 'Garagem de motos',
    tagline: 'Pistas progressivas. Uma moto. Descubra antes que elas acabem.',
    solo: 'Quatro alternativas no fim. A moto só aparece quando você responde.',
    duo: 'Você vê a resposta e lê as pistas para outra pessoa adivinhar.',
    sprite: 'motorcycle.gif',
  },
};

const KIND_GLOW: Record<VehicleKind, string> = {
  car: 'from-flame-600/15',
  truck: 'from-mint-400/15',
  motorcycle: 'from-crimson-700/20',
};

const KIND_MARKER: Record<VehicleKind, string> = {
  car: 'bg-flame-500',
  truck: 'bg-mint-400',
  motorcycle: 'bg-flame-500',
};

const KIND_GARAGE_TINT: Record<VehicleKind, string> = {
  car: '',
  truck: '',
  motorcycle: 'bg-crimson-700/10',
};

const KIND_SPRITE: Record<VehicleKind, string> = {
  car: 'h-44 w-44 drop-shadow-[0_12px_24px_rgba(232,69,44,0.32)] sm:h-52 sm:w-52',
  truck: 'h-48 w-48 drop-shadow-[0_12px_24px_rgba(61,220,151,0.28)] sm:h-56 sm:w-56',
  motorcycle: 'h-48 w-48 drop-shadow-[0_12px_24px_rgba(232,69,44,0.36)] sm:h-56 sm:w-56',
};

const MODES: { mode: GameMode; title: string; accent: string }[] = [
  { mode: 'solo', title: 'Sozinho', accent: 'text-flame-400' },
  { mode: 'duo', title: 'Em dupla', accent: 'text-sky-400' },
];

function MotorcycleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="M8 17h3l2.5-5H17l2 5M9 17l-2.5-7H4m4-1h4l2 3m1-3h3" />
    </svg>
  );
}

const CATEGORIES: { kind: VehicleKind; icon: ComponentType<{ className?: string }> }[] = [
  { kind: 'car', icon: Car01 },
  { kind: 'truck', icon: Truck01 },
  { kind: 'motorcycle', icon: MotorcycleIcon },
];

function playShutter(shutter: HTMLDivElement, from: number, to: number, duration: number) {
  const animation = shutter.animate(
    [{ transform: `scaleY(${from})` }, { transform: `scaleY(${to})` }],
    {
      duration,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  );

  return new Promise<void>((resolve) => {
    let settled = false;
    let timeout = 0;
    const complete = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeout);

      if (animation.playState !== 'finished') {
        animation.finish();
      }

      resolve();
    };

    timeout = window.setTimeout(complete, duration + 120);
    animation.finished.then(complete, complete);
  });
}

export function HomeScreen({ kind, onSelectKind, onSelectMode, onOpenCredits }: HomeScreenProps) {
  const copy = KIND_COPY[kind];
  const shutterRef = useRef<HTMLDivElement>(null);
  const switchingRef = useRef(false);
  const [switching, setSwitching] = useState(false);
  const [loadedSprite, setLoadedSprite] = useState<VehicleKind | null>(null);

  useEffect(() => {
    for (const category of Object.values(KIND_COPY)) {
      const image = new Image();
      image.src = asset(category.sprite);
    }
  }, []);

  async function selectKind(nextKind: VehicleKind) {
    const shutter = shutterRef.current;

    if (nextKind === kind || switchingRef.current || !shutter) {
      return;
    }

    switchingRef.current = true;
    setSwitching(true);

    try {
      await playShutter(shutter, 0, 1, 320);

      flushSync(() => onSelectKind(nextKind));
      await playShutter(shutter, 1, 0, 380);
    } finally {
      for (const animation of shutter.getAnimations()) {
        animation.cancel();
      }

      switchingRef.current = false;
      setSwitching(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-5 py-8 sm:py-12">
      <div className="flex flex-col gap-7 sm:gap-8">
        <header className="text-center">
          <h1 className="font-display text-chalk-100 text-4xl font-bold tracking-tight sm:text-5xl">
            Pista<span className="text-flame-500">Certa</span>
          </h1>
        </header>

        <section className="flex flex-col gap-4" aria-label="Categoria do jogo">
          <div className="border-ink-700 bg-ink-900/70 shadow-hard relative h-52 overflow-hidden border-2 sm:h-60">
            <div className={`pointer-events-none absolute inset-0 ${KIND_GARAGE_TINT[kind]}`} />
            <div className="garage-grid pointer-events-none absolute inset-0" />
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent ${KIND_GLOW[kind]}`}
            />

            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className={`size-2 ${KIND_MARKER[kind]}`} aria-hidden />
              <span className="text-chalk-500 font-display text-[0.6rem] tracking-[0.18em] uppercase">
                <span className="sm:hidden">{copy.label}</span>
                <span className="hidden sm:inline">{copy.garage}</span>
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              {CATEGORIES.filter((category) => category.kind !== kind).map(
                ({ kind: categoryKind, icon: Icon }) => (
                  <button
                    key={categoryKind}
                    type="button"
                    onClick={() => selectKind(categoryKind)}
                    disabled={switching}
                    aria-label={`Trocar para ${KIND_COPY[categoryKind].label.toLocaleLowerCase('pt-BR')}`}
                    title={`Trocar para ${KIND_COPY[categoryKind].label.toLocaleLowerCase('pt-BR')}`}
                    className="border-ink-600 bg-ink-950/75 text-chalk-500 hover:border-flame-500 hover:text-flame-400 focus-visible:outline-flame-500 shadow-hard-sm flex size-10 items-center justify-center border-2 transition-colors disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Icon className="size-5" />
                  </button>
                ),
              )}
            </div>

            <motion.img
              key={kind}
              src={asset(copy.sprite)}
              alt=""
              aria-hidden
              onLoad={() => setLoadedSprite(kind)}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={
                loadedSprite === kind
                  ? { opacity: 1, y: [10, -2, 0], scale: 1 }
                  : { opacity: 0, y: 10, scale: 0.98 }
              }
              transition={{ ...motionSpring, delay: 0.05 }}
              className={`pixelated absolute inset-0 m-auto object-contain ${KIND_SPRITE[kind]}`}
            />

            <AnimatePresence>
              {loadedSprite !== kind && (
                <motion.div
                  role="status"
                  aria-label="Carregando veículo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center gap-1.5"
                >
                  {[0, 1, 2].map((index) => (
                    <motion.span
                      key={index}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: index * 0.12 }}
                      className="bg-chalk-500 size-1.5"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div
              ref={shutterRef}
              aria-hidden
              style={{ transform: 'scaleY(0)' }}
              className="garage-shutter pointer-events-none absolute inset-0 z-[30] origin-top"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-3 opacity-35">
              <span className="bg-chalk-500 h-px w-12" />
              <span className="bg-flame-400 h-px w-5" />
              <span className="bg-chalk-500 h-px w-12" />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={kind}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-chalk-300 min-h-10 text-center text-sm text-balance"
            >
              {copy.tagline}
            </motion.p>
          </AnimatePresence>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {MODES.map(({ mode, title, accent }) => (
            <motion.button
              key={mode}
              type="button"
              onClick={() => onSelectMode(mode)}
              disabled={switching}
              whileTap={{ scale: 0.985 }}
              transition={motionSpring}
              className="group border-chalk-500/30 bg-ink-900/80 hover:border-flame-500 focus-visible:outline-flame-500 shadow-hard relative overflow-hidden border-2 px-5 py-4 text-left backdrop-blur transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
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

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onOpenCredits}
            disabled={switching}
            className="text-chalk-500 hover:text-chalk-300 focus-visible:outline-flame-500 text-xs disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Créditos das imagens
          </button>

          <p className="font-display text-chalk-500 text-[0.625rem] tracking-[0.18em]">
            Versão {APP_VERSION}
          </p>
        </div>
      </div>
    </main>
  );
}
