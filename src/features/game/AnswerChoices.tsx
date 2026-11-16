import { useId } from 'react';
import { motion } from 'motion/react';
import type { RoundChoice } from '@/domain/round/choices';

export type AnswerChoicesProps = {
  choices: RoundChoice[];
  selectedId: string | null;
  submitting: boolean;
  onSelect: (choiceId: string) => void;
  onConfirm: () => void;
};

export function AnswerChoices({
  choices,
  selectedId,
  submitting,
  onSelect,
  onConfirm,
}: AnswerChoicesProps) {
  const groupName = useId();

  return (
    <div className="flex flex-col gap-4">
      <fieldset disabled={submitting}>
        <legend className="font-display text-chalk-100 mb-3 text-xs font-bold tracking-[0.18em] uppercase">
          Qual desses é?
        </legend>
        <div className="grid gap-2 md:grid-cols-2 md:gap-3">
          {choices.map((choice, index) => {
            const selected = choice.id === selectedId;
            return (
              <label
                key={choice.id}
                className={`focus-within:outline-flame-400 flex min-h-14 cursor-pointer items-center gap-3 border-2 px-4 py-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 ${
                  selected
                    ? 'border-flame-500 bg-flame-500/15 shadow-hard-sm'
                    : 'border-ink-700 bg-ink-850 hover:border-chalk-500/50'
                } ${submitting ? 'pointer-events-none opacity-60' : ''}`}
              >
                <span
                  aria-hidden
                  className={`font-display flex size-7 shrink-0 items-center justify-center border text-xs font-bold ${selected ? 'border-flame-400 text-flame-400' : 'border-ink-600 text-chalk-500'}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="radio"
                  name={groupName}
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
              </label>
            );
          })}
        </div>
      </fieldset>
      <motion.button
        type="button"
        disabled={!selectedId || submitting}
        onClick={onConfirm}
        whileTap={{ scale: 0.98 }}
        className="from-flame-600 to-flame-400 text-ink-950 font-display border-flame-400 shadow-hard focus-visible:outline-flame-400 border-2 bg-gradient-to-r px-5 py-4 text-sm font-bold tracking-[0.15em] uppercase transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 md:self-end md:min-w-52"
      >
        {submitting ? 'Conferindo…' : 'Confirmar resposta'}
      </motion.button>
    </div>
  );
}
