import { Button } from '@/components/base/buttons/button';
import type { Outcome } from '@/domain/round/round.types';

type AnswerControlsProps = {
  onAnswer: (outcome: Outcome) => void;
  disabled?: boolean;
};

export function AnswerControls({ onAnswer, disabled }: AnswerControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button size="lg" color="primary" isDisabled={disabled} onClick={() => onAnswer('correct')}>
        Acertei
      </Button>
      <Button
        size="lg"
        color="secondary"
        isDisabled={disabled}
        onClick={() => onAnswer('incorrect')}
      >
        Errei
      </Button>
    </div>
  );
}
