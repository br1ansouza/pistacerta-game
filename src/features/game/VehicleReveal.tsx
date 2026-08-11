import { Button } from '@/components/base/buttons/button';
import type { ResolvedClue } from '@/domain/clues/clue.types';
import type { Outcome } from '@/domain/round/round.types';
import { describeIdentity, type VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import { ClueList } from './ClueList';
import { VehicleImage } from './VehicleImage';

type VehicleRevealProps = {
  identity: VehicleIdentity;
  outcome: Outcome;
  clues: ResolvedClue[];
  onNextRound: () => void;
  onBackHome: () => void;
};

export function VehicleReveal({
  identity,
  outcome,
  clues,
  onNextRound,
  onBackHome,
}: VehicleRevealProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p
          className={
            outcome === 'correct'
              ? 'bg-success-primary text-success-primary self-start rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase'
              : 'bg-secondary text-tertiary self-start rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase'
          }
        >
          {outcome === 'correct' ? 'Acertou' : 'Era esse'}
        </p>
        <h2 className="text-primary text-display-xs font-bold">{describeIdentity(identity)}</h2>
        {identity.generation && <p className="text-tertiary text-sm">{identity.generation}</p>}
      </header>

      <VehicleImage identity={identity} />

      <section className="border-secondary bg-secondary rounded-2xl border px-5 py-3">
        <ClueList clues={clues} initialCount={-1} />
      </section>

      <div className="flex flex-col gap-3">
        <Button size="lg" color="primary" onClick={onNextRound}>
          Próxima rodada
        </Button>
        <Button size="lg" color="link-gray" onClick={onBackHome}>
          Trocar de modo
        </Button>
      </div>
    </div>
  );
}
