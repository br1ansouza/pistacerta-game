import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedClue } from '@/domain/clues/clue.types';

type CluePagesProps = {
  clues: ResolvedClue[];
  pageSize: number;
  freshKey: string | null;
};

export function CluePages({ clues, pageSize, freshKey }: CluePagesProps) {
  const pages: ResolvedClue[][] = [];

  for (let index = 0; index < clues.length; index += pageSize) {
    pages.push(clues.slice(index, index + pageSize));
  }

  const lastPage = Math.max(0, pages.length - 1);
  const [page, setPage] = useState(lastPage);
  const previousPageCount = useRef(pages.length);

  useEffect(() => {
    if (pages.length !== previousPageCount.current) {
      previousPageCount.current = pages.length;
      setPage(pages.length - 1);
    }
  }, [pages.length]);

  useEffect(() => {
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, lastPage]);

  const current = pages[Math.min(page, lastPage)] ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.dl
            key={page}
            drag={pages.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 && page < lastPage) setPage(page + 1);
              if (info.offset.x > 60 && page > 0) setPage(page - 1);
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="grid cursor-grab grid-cols-2 gap-x-3 gap-y-4 active:cursor-grabbing sm:grid-cols-3"
          >
            {current.map((clue) => {
              const fresh = clue.key === freshKey;

              return (
                <motion.div
                  key={clue.key}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                  className={
                    fresh
                      ? 'border-flame-500 border-l-[3px] pl-3'
                      : 'border-ink-700 border-l-[3px] pl-3'
                  }
                >
                  <dt className="text-chalk-500 font-display text-[0.6rem] leading-tight tracking-[0.14em] uppercase">
                    {clue.label}
                  </dt>
                  <dd
                    className={
                      fresh
                        ? 'text-flame-400 font-display text-base leading-tight font-bold tabular-nums'
                        : 'text-chalk-100 font-display text-base leading-tight font-bold tabular-nums'
                    }
                  >
                    {clue.value}
                  </dd>
                </motion.div>
              );
            })}
          </motion.dl>
        </AnimatePresence>
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            aria-label="Bloco anterior"
            className="text-chalk-500 hover:text-flame-400 px-2 text-xs transition disabled:opacity-25"
          >
            &lsaquo;
          </button>

          {pages.map((entries, index) => (
            <button
              key={entries[0]?.key ?? index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Bloco ${index + 1}`}
              aria-current={index === page}
              className={
                index === page
                  ? 'bg-flame-500 h-1.5 w-6 transition-all'
                  : 'bg-ink-600 hover:bg-ink-700 h-1.5 w-1.5 transition-all'
              }
            />
          ))}

          <button
            type="button"
            onClick={() => setPage(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            aria-label="Próximo bloco"
            className="text-chalk-500 hover:text-flame-400 px-2 text-xs transition disabled:opacity-25"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
