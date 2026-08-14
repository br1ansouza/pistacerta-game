import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { InfoCircle } from '@untitledui/icons';
import type { ResolvedClue } from '@/domain/clues/clue.types';
import { motionEase } from '@/lib/motion';

type CluePagesProps = {
  clues: ResolvedClue[];
  pageSize: number;
  freshKey: string | null;
};

function ClueHelp({ label, children }: { label: string; children: string }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const open = pinned || hovered || focused;

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const tooltipHalfWidth = 96;
      const viewportMargin = 16;
      const centered = rect.left + rect.width / 2;
      const left = Math.min(
        Math.max(centered, viewportMargin + tooltipHalfWidth),
        globalThis.innerWidth - viewportMargin - tooltipHalfWidth,
      );

      setPosition({ left, top: rect.bottom + 8 });
    }

    updatePosition();
    globalThis.addEventListener('resize', updatePosition);
    globalThis.addEventListener('scroll', updatePosition, true);

    return () => {
      globalThis.removeEventListener('resize', updatePosition);
      globalThis.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!pinned) {
      return;
    }

    function closeOnOutsidePress(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinned(false);
        buttonRef.current?.blur();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPinned(false);
        buttonRef.current?.blur();
      }
    }

    globalThis.addEventListener('pointerdown', closeOnOutsidePress);
    globalThis.addEventListener('keydown', closeOnEscape);

    return () => {
      globalThis.removeEventListener('pointerdown', closeOnOutsidePress);
      globalThis.removeEventListener('keydown', closeOnEscape);
    };
  }, [pinned]);

  return (
    <span ref={rootRef} className="group relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`O que significa ${label}?`}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setPinned(false);
        }}
        onClick={() => {
          if (pinned) {
            setPinned(false);
            buttonRef.current?.blur();
          } else {
            setPinned(true);
          }
        }}
        className="text-chalk-500 hover:text-flame-400 focus-visible:outline-flame-500 inline-flex size-4 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        <InfoCircle className="size-3.5" />
      </button>

      {open &&
        position &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{ left: position.left, top: position.top }}
            className="border-ink-600 bg-ink-950 text-chalk-300 shadow-hard-sm pointer-events-none fixed z-[60] w-48 -translate-x-1/2 border-2 px-3 py-2 text-[0.7rem] leading-relaxed font-normal tracking-normal normal-case"
          >
            {children}
          </span>,
          globalThis.document.body,
        )}
    </span>
  );
}

function ClueCell({ clue, fresh, width }: { clue: ResolvedClue; fresh: boolean; width: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: motionEase }}
      className={`min-h-10 py-0.5 ${
        fresh ? 'border-flame-500 border-l-[3px] pl-3' : 'border-ink-700 border-l-[3px] pl-3'
      } ${width}`}
    >
      <dt className="text-chalk-300 font-display flex items-center gap-1 text-[0.6rem] leading-tight tracking-[0.14em] uppercase">
        <span>{clue.label}</span>
        {clue.help && <ClueHelp label={clue.label}>{clue.help}</ClueHelp>}
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

function clueWidth(
  clue: ResolvedClue,
  pageIndex: number,
  pageLength: number,
  globalIndex: number,
  total: number,
): string {
  if (clue.key === 'cabin' && clue.value.length > 36) {
    return 'col-span-full col-start-auto lg:col-span-2';
  }

  const lastOnPage = pageIndex === pageLength - 1;
  const lastOverall = globalIndex === total - 1;
  const startsFinalPair = total % 4 === 2 && globalIndex === total - 2;

  const desktopWidth = lastOverall && total % 4 === 1 ? 'lg:col-span-2' : 'lg:col-span-1';
  const desktopStart =
    (lastOverall && total % 4 === 1) || startsFinalPair ? 'lg:col-start-2' : 'lg:col-start-auto';

  return [
    lastOnPage && pageLength % 2 === 1 ? 'col-span-2' : 'col-span-1',
    lastOnPage && pageLength % 3 === 1
      ? 'sm:col-start-2 sm:col-span-1'
      : 'sm:col-start-auto sm:col-span-1',
    desktopStart,
    desktopWidth,
  ].join(' ');
}

export function CluePages({ clues, pageSize, freshKey }: CluePagesProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDListElement | null)[]>([]);
  const [page, setPage] = useState(0);
  const [trackHeight, setTrackHeight] = useState<number | null>(null);

  const pages: ResolvedClue[][] = [];

  for (let index = 0; index < clues.length; index += pageSize) {
    pages.push(clues.slice(index, index + pageSize));
  }

  const previousCount = useRef(pages.length);

  useLayoutEffect(() => {
    const pageElements = pageRefs.current
      .slice(0, pages.length)
      .filter((element) => element !== null);

    if (pageElements.length === 0) {
      setTrackHeight(null);
      return;
    }

    function updateHeight() {
      if (globalThis.matchMedia('(width >= 64rem)').matches) {
        setTrackHeight(null);
        return;
      }

      setTrackHeight(Math.max(...pageElements.map((element) => element.offsetHeight)));
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    pageElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [clues.length, pages.length]);

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
        style={
          {
            '--clue-track-height': trackHeight === null ? 'auto' : `${trackHeight}px`,
          } as CSSProperties
        }
        className="scrollbar-hide flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain [height:var(--clue-track-height)] lg:grid lg:h-auto lg:auto-rows-min lg:grid-cols-4 lg:gap-x-3 lg:gap-y-4 lg:overflow-visible"
      >
        {pages.map((entries, index) => (
          <dl
            key={entries[0]?.key ?? index}
            ref={(element) => {
              pageRefs.current[index] = element;
            }}
            className="grid w-full shrink-0 snap-start auto-rows-min content-start grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:contents"
          >
            {entries.map((clue, entryIndex) => (
              <ClueCell
                key={clue.key}
                clue={clue}
                fresh={clue.key === freshKey}
                width={clueWidth(
                  clue,
                  entryIndex,
                  entries.length,
                  index * pageSize + entryIndex,
                  clues.length,
                )}
              />
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
