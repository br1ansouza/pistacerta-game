import type { Vehicle } from '../vehicle/vehicle.schema.ts';

export const CHOICE_COUNT = 4;
const NEAR_YEARS = 8;

export type RoundChoice = {
  id: string;
  label: string;
};

export function choiceLabel(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model}`;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = result[index];
    const swapped = result[target];

    if (current !== undefined && swapped !== undefined) {
      result[index] = swapped;
      result[target] = current;
    }
  }

  return result;
}

export function buildChoices(
  answer: Vehicle,
  pool: readonly Vehicle[],
  random: () => number = Math.random,
): RoundChoice[] {
  const answerLabel = choiceLabel(answer);

  const others = pool.filter(
    (vehicle) => vehicle.slug !== answer.slug && choiceLabel(vehicle) !== answerLabel,
  );

  const near = others.filter((vehicle) => Math.abs(vehicle.year - answer.year) <= NEAR_YEARS);
  const far = others.filter((vehicle) => Math.abs(vehicle.year - answer.year) > NEAR_YEARS);

  const distractors = [...shuffle(near, random), ...shuffle(far, random)].slice(
    0,
    CHOICE_COUNT - 1,
  );

  return shuffle(
    [answer, ...distractors].map((vehicle) => ({
      id: vehicle.slug,
      label: choiceLabel(vehicle),
    })),
    random,
  );
}
