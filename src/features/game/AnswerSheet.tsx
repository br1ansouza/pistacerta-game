import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AnswerChoices, type AnswerChoicesProps } from './AnswerChoices';

type AnswerSheetProps = AnswerChoicesProps & { onClose: () => void };

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
    const desktop = globalThis.matchMedia('(min-width: 768px)');
    function closeOnDesktop() {
      if (desktop.matches) onClose();
    }
    desktop.addEventListener('change', closeOnDesktop);
    closeOnDesktop();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', closeOnDesktop);
    };
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
        aria-label="Escolha o veículo"
        tabIndex={-1}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        className="border-flame-500/60 bg-ink-900 relative flex max-h-[90dvh] w-full max-w-md overflow-y-auto flex-col gap-4 border-2 p-5 shadow-[0_-6px_0_0_var(--color-crimson-700)] outline-none sm:shadow-[6px_6px_0_0_var(--color-crimson-700)]"
      >
        <span aria-hidden className="bg-ink-600 mx-auto h-1 w-10 sm:hidden" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-chalk-100 text-xs font-bold tracking-[0.18em] uppercase">
            Escolha o veículo
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

        <AnswerChoices
          choices={choices}
          selectedId={selectedId}
          submitting={submitting}
          onSelect={onSelect}
          onConfirm={onConfirm}
        />
        <div className="flex flex-col gap-2">
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
