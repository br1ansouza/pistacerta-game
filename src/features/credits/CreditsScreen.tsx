import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from '@untitledui/icons';
import { fetchCredits, type ImageCredit } from '@/lib/api';

type CreditsScreenProps = {
  onBack: () => void;
};

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  const [credits, setCredits] = useState<ImageCredit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetchCredits(controller.signal);
        setCredits(response.credits);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar');
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 py-6 lg:max-w-3xl">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="border-ink-700 text-chalk-500 hover:text-flame-400 hover:border-flame-500/50 focus-visible:outline-flame-500 flex size-9 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="font-display text-chalk-100 text-base font-bold">Créditos</h1>
      </header>

      <p className="text-chalk-500 text-xs">Fotos do Wikimedia Commons.</p>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      {!credits && !error && <p className="text-chalk-500 text-xs">Carregando…</p>}

      {credits && (
        <ul className="flex flex-col">
          {credits.map((credit, index) => (
            <motion.li
              key={credit.vehicle}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              className="border-ink-800 border-b py-2 last:border-0"
            >
              <a
                href={credit.sourceUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="text-chalk-500 hover:text-flame-400 text-xs transition"
              >
                {credit.vehicle} — {credit.author ?? 'autor não declarado'}
                {credit.license ? ` · ${credit.license}` : ''}
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </main>
  );
}
