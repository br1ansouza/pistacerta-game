import type { ResolvedClue } from '@/domain/clues/clue.types';

type ClueListProps = {
  clues: ResolvedClue[];
  initialCount: number;
};

export function ClueList({ clues, initialCount }: ClueListProps) {
  return (
    <dl className="flex flex-col">
      {clues.map((clue, index) => (
        <div
          key={clue.key}
          className={
            index === initialCount
              ? 'border-secondary flex items-baseline justify-between gap-4 border-t pt-4 pb-2'
              : 'flex items-baseline justify-between gap-4 py-2'
          }
        >
          <dt className="text-tertiary text-sm">{clue.label}</dt>
          <dd className="text-primary text-md text-right font-semibold tabular-nums">
            {clue.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
