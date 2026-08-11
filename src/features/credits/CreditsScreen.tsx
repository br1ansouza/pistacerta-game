import { useEffect, useState } from 'react';
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
          className="border-secondary text-tertiary hover:text-primary hover:border-primary focus-visible:outline-brand flex size-9 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-primary text-lg font-bold">Créditos das imagens</h1>
      </header>

      <p className="text-tertiary text-sm">Fotos do Wikimedia Commons.</p>

      {error && <p className="text-error-primary text-sm">{error}</p>}

      {!credits && !error && <p className="text-tertiary text-sm">Carregando…</p>}

      {credits && (
        <ul className="flex flex-col">
          {credits.map((credit) => (
            <li key={credit.vehicle} className="border-secondary border-b py-2 last:border-0">
              <a
                href={credit.sourceUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="text-tertiary hover:text-primary text-xs"
              >
                {credit.vehicle} — {credit.author ?? 'autor não declarado'}
                {credit.license ? ` · ${credit.license}` : ''}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
