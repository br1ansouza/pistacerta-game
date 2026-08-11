import type { GameMode } from '@/domain/round/round.types';

type HomeScreenProps = {
  onSelectMode: (mode: GameMode) => void;
  onOpenCredits: () => void;
};

const MODES: { mode: GameMode; title: string; description: string }[] = [
  {
    mode: 'solo',
    title: 'Sozinho',
    description: 'Você recebe as pistas e tenta adivinhar. O carro só aparece quando responder.',
  },
  {
    mode: 'duo',
    title: 'Em dupla',
    description: 'Você vê o carro e conduz a rodada, perguntando as pistas para outra pessoa.',
  },
];

export function HomeScreen({ onSelectMode, onOpenCredits }: HomeScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden
          className="border-secondary text-quaternary flex size-20 items-center justify-center rounded-2xl border border-dashed text-xs"
        >
          logo
        </div>
        <h1 className="text-primary text-display-sm font-bold tracking-tight">PistaCerta</h1>
        <p className="text-tertiary text-md text-balance">
          Doze pistas. Um carro. Descubra antes que elas acabem.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-secondary text-sm font-semibold">Como vocês vão jogar?</h2>

        {MODES.map(({ mode, title, description }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSelectMode(mode)}
            className="border-secondary bg-secondary hover:border-brand focus-visible:outline-brand group flex items-center justify-between gap-4 rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="flex flex-col gap-1">
              <span className="text-primary text-md font-semibold">{title}</span>
              <span className="text-tertiary text-sm">{description}</span>
            </span>
            <span
              aria-hidden
              className="text-quaternary group-hover:text-brand-secondary shrink-0 text-xl transition"
            >
              &rsaquo;
            </span>
          </button>
        ))}
      </section>

      <button
        type="button"
        onClick={onOpenCredits}
        className="text-quaternary hover:text-tertiary focus-visible:outline-brand self-center text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Créditos das imagens
      </button>
    </main>
  );
}
