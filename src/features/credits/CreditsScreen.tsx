import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, SearchLg } from '@untitledui/icons';
import { fetchCredits, type ImageCredit } from '@/lib/api';

type CreditsScreenProps = {
  onBack: () => void;
};

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  const [credits, setCredits] = useState<ImageCredit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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

  const groups = useMemo(() => {
    if (!credits) {
      return [];
    }

    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = normalized
      ? credits.filter((credit) =>
          [credit.vehicle, credit.author, credit.license].some((value) =>
            value?.toLocaleLowerCase('pt-BR').includes(normalized),
          ),
        )
      : credits;

    const grouped = new Map<string, ImageCredit[]>();

    for (const credit of filtered) {
      const letter = credit.vehicle.at(0)?.toLocaleUpperCase('pt-BR') ?? '#';
      grouped.set(letter, [...(grouped.get(letter) ?? []), credit]);
    }

    return [...grouped.entries()].toSorted(([first], [second]) =>
      first.localeCompare(second, 'pt-BR'),
    );
  }, [credits, query]);

  const resultCount = groups.reduce((total, [, entries]) => total + (entries?.length ?? 0), 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="border-ink-700 text-chalk-500 hover:text-flame-400 hover:border-flame-500 focus-visible:outline-flame-500 shadow-hard-sm flex size-9 shrink-0 items-center justify-center border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="font-display text-chalk-100 text-base font-bold">Créditos</h1>
          <p className="text-chalk-500 text-xs">Origem e autoria das imagens do catálogo.</p>
        </div>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      {!credits && !error && <p className="text-chalk-500 text-xs">Carregando…</p>}

      {credits && (
        <>
          <label className="border-ink-700 bg-ink-900 focus-within:border-flame-500 flex items-center gap-3 border-2 px-3 py-2.5 transition-colors">
            <SearchLg className="text-chalk-500 size-4 shrink-0" />
            <span className="sr-only">Buscar crédito</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar automóvel, autor ou licença"
              className="text-chalk-100 placeholder:text-chalk-500 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <span className="text-chalk-500 font-display text-[0.65rem] tabular-nums">
              {resultCount}
            </span>
          </label>

          {groups.length === 0 ? (
            <p className="text-chalk-500 py-8 text-center text-sm">Nenhum crédito encontrado.</p>
          ) : (
            <div className="grid gap-x-8 lg:grid-cols-2">
              {groups.map(([letter, entries]) => (
                <section
                  key={letter}
                  className="border-ink-800 border-t py-4 first:border-0 lg:first:border-t"
                >
                  <h2 className="text-flame-400 font-display mb-1 text-xs font-bold">{letter}</h2>
                  <ul className="flex flex-col">
                    {entries?.map((credit, index) => (
                      <motion.li
                        key={credit.vehicle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.015, 0.16) }}
                        className="border-ink-800 border-b py-2.5 last:border-0"
                      >
                        <a
                          href={credit.sourceUrl ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex flex-col gap-0.5"
                        >
                          <span className="text-chalk-300 group-hover:text-flame-400 text-xs font-medium transition-colors">
                            {credit.vehicle}
                          </span>
                          <span className="text-chalk-500 text-[0.7rem]">
                            {credit.author ?? 'autor não declarado'}
                            {credit.license ? ` · ${credit.license}` : ''}
                          </span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
