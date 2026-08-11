import { useEffect, useRef } from 'react';
import { Button } from '@/components/base/buttons/button';
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
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Escolha o veículo"
        tabIndex={-1}
        className="border-secondary bg-primary relative flex w-full max-w-md flex-col gap-4 rounded-t-2xl border p-5 shadow-xl outline-none sm:rounded-2xl"
      >
        <h2 className="text-primary text-md font-semibold">Qual desses é?</h2>

        <fieldset disabled={submitting} className="flex flex-col gap-2">
          {choices.map((choice) => {
            const selected = choice.id === selectedId;

            return (
              <label
                key={choice.id}
                className={
                  selected
                    ? 'border-brand bg-brand-primary flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3'
                    : 'border-secondary bg-primary hover:border-primary flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3'
                }
              >
                <input
                  type="radio"
                  name="vehicle-choice"
                  value={choice.id}
                  checked={selected}
                  onChange={() => onSelect(choice.id)}
                  className="accent-brand-solid size-4 shrink-0"
                />
                <span
                  className={
                    selected
                      ? 'text-brand-secondary text-sm font-semibold'
                      : 'text-primary text-sm font-medium'
                  }
                >
                  {choice.label}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            color="primary"
            isDisabled={!selectedId || submitting}
            onClick={onConfirm}
          >
            {submitting ? 'Conferindo…' : 'Confirmar'}
          </Button>
          <Button size="md" color="link-gray" isDisabled={submitting} onClick={onClose}>
            Ver mais pistas
          </Button>
        </div>
      </div>
    </div>
  );
}
