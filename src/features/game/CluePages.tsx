import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { ResolvedClue } from '@/domain/clues/clue.types';

type CluePagesProps = {
  clues: ResolvedClue[];
  pageSize: number;
  freshKey: string | null;
};

function ClueCell({ clue, fresh }: { clue: ResolvedClue; fresh: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
      className={
        fresh ? 'border-flame-500 border-l-[3px] pl-3' : 'border-ink-700 border-l-[3px] pl-3'
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
}

export function CluePages({ clues, pageSize, freshKey }: CluePagesProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const pages: ResolvedClue[][] = [];

  for (let index = 0; index < clues.length; index += pageSize) {
    pages.push(clues.slice(index, index + pageSize));
  }

  const previousCount = useRef(pages.length);

  useEffect(() => {
    if (pages.length === previousCount.current) {
      return;
    }

    previousCount.current = pages.length;

    const track = trackRef.current;

    if (track && globalThis.matchMedia('(width < 64rem)').matches) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    }
  }, [pages.length]);

  function onScroll() {
    const track = trackRef.current;

    if (!track || track.clientWidth === 0) {
      return;
    }

    setPage(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goTo(index: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:grid lg:grid-cols-4 lg:gap-x-3 lg:gap-y-4 lg:overflow-visible"
      >
        {pages.map((entries, index) => (
          <dl
            key={entries[0]?.key ?? index}
            className="grid w-full shrink-0 snap-start grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:contents"
          >
            {entries.map((clue) => (
              <ClueCell key={clue.key} clue={clue} fresh={clue.key === freshKey} />
            ))}
          </dl>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-2 lg:hidden">
          {pages.map((entries, index) => (
            <button
              key={entries[0]?.key ?? index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Bloco ${index + 1}`}
              aria-current={index === page}
              className={
                index === page
                  ? 'bg-flame-500 h-1.5 w-6 transition-all'
                  : 'bg-ink-600 hover:bg-ink-700 h-1.5 w-1.5 transition-all'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
