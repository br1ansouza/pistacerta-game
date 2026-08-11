import type { RoundChoice } from '@/domain/round/choices';

type ChoiceListProps = {
  choices: RoundChoice[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (choiceId: string) => void;
};

export function ChoiceList({ choices, selectedId, disabled, onSelect }: ChoiceListProps) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="text-secondary mb-2 text-sm font-semibold">Qual desses é?</legend>

      {choices.map((choice) => {
        const selected = choice.id === selectedId;

        return (
          <label
            key={choice.id}
            className={
              selected
                ? 'border-brand bg-brand-primary flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition'
                : 'border-secondary bg-primary hover:border-primary flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition'
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
  );
}
