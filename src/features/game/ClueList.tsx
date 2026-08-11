import type { ResolvedClue } from '@/domain/clues/clue.types';

type ClueListProps = {
  clues: ResolvedClue[];
  highlightFrom?: number;
};

export function ClueList({ clues, highlightFrom = -1 }: ClueListProps) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {clues.map((clue, index) => (
        <div
          key={clue.key}
          className={
            index >= highlightFrom && highlightFrom >= 0
              ? 'border-brand bg-brand-primary flex flex-col gap-0.5 rounded-xl border px-3 py-2'
              : 'border-secondary bg-primary flex flex-col gap-0.5 rounded-xl border px-3 py-2'
          }
        >
          <dt className="text-quaternary text-xs">{clue.label}</dt>
          <dd className="text-primary text-sm font-semibold tabular-nums">{clue.value}</dd>
        </div>
      ))}
    </dl>
  );
}
