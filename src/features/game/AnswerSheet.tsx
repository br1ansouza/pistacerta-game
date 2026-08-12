import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { RoundChoice } from '@/domain/round/choices';

type AnswerSheetProps = {
  choices: RoundChoice[];
  selectedId: string | null;
  submitting: boolean;
  onSelect: (choiceId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function AnswerSheet({
  choices,
  selectedId,
  submitting,
  onSelect,
  onConfirm,
  onClose,
}: AnswerSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    globalThis.addEventListener('keydown', onKeyDown);

    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Escolha o automóvel"
        tabIndex={-1}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        className="border-flame-500/60 bg-ink-900 relative flex w-full max-w-md flex-col gap-4 border-2 p-5 shadow-[0_-6px_0_0_var(--color-crimson-700)] outline-none sm:shadow-[6px_6px_0_0_var(--color-crimson-700)]"
      >
        <span aria-hidden className="bg-ink-600 mx-auto h-1 w-10 sm:hidden" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-chalk-100 text-xs font-bold tracking-[0.18em] uppercase">
            Qual desses é?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="border-ink-700 text-chalk-500 hover:border-flame-500 hover:text-flame-400 focus-visible:outline-flame-500 flex size-7 shrink-0 items-center justify-center border-2 text-sm leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            &times;
          </button>
        </div>

        <fieldset disabled={submitting} className="flex flex-col gap-2">
          {choices.map((choice, index) => {
            const selected = choice.id === selectedId;

            return (
              <motion.label
                key={choice.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.05 + index * 0.05,
                  type: 'spring',
                  stiffness: 500,
                  damping: 34,
                }}
                className={
                  selected
                    ? 'border-flame-500 bg-flame-500/15 shadow-hard-sm flex cursor-pointer items-center gap-3 border-2 px-4 py-3'
                    : 'border-ink-700 bg-ink-850 hover:border-chalk-500/50 flex cursor-pointer items-center gap-3 border-2 px-4 py-3 transition-colors'
                }
              >
                <span
                  aria-hidden
                  className={`flex size-4 shrink-0 items-center justify-center border-2 ${
                    selected ? 'border-flame-400' : 'border-chalk-500/60'
                  }`}
                >
                  {selected && <span className="bg-flame-400 size-2" />}
                </span>
                <input
                  type="radio"
                  name="vehicle-choice"
                  value={choice.id}
                  checked={selected}
                  onChange={() => onSelect(choice.id)}
                  className="sr-only"
                />
                <span
                  className={
                    selected
                      ? 'text-flame-400 text-sm font-bold'
                      : 'text-chalk-100 text-sm font-medium'
                  }
                >
                  {choice.label}
                </span>
              </motion.label>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-2">
          <motion.button
            type="button"
            disabled={!selectedId || submitting}
            onClick={onConfirm}
            whileTap={{ scale: 0.98 }}
            className="from-flame-600 to-flame-400 text-ink-950 font-display border-flame-400 shadow-hard focus-visible:outline-flame-400 border-2 bg-gradient-to-r px-5 py-4 text-sm font-bold tracking-[0.15em] uppercase transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {submitting ? 'Conferindo…' : 'Confirmar'}
          </motion.button>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="text-chalk-500 hover:text-chalk-300 focus-visible:outline-flame-500 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ver mais pistas
          </button>
        </div>
      </motion.div>
    </div>
  );
}
