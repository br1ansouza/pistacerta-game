import type { Car, Vehicle } from '../vehicle/vehicle.schema.ts';

export const CHOICE_COUNT = 4;
const RANDOM_VARIATION = 0.75;

type BodyType = NonNullable<Car['bodyType']>;

const RELATED_BODY_TYPES: Partial<Record<BodyType, readonly BodyType[]>> = {
  hatch: ['sedã', 'perua'],
  sedã: ['hatch', 'perua'],
  suv: ['minivan', 'picape'],
  cupê: ['conversível'],
  conversível: ['cupê'],
  picape: ['suv'],
  perua: ['minivan', 'hatch'],
  minivan: ['perua', 'suv'],
};

export type RoundChoice = {
  id: string;
  label: string;
};

export function choiceLabel(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model}`;
}

function choiceKey(vehicle: Vehicle): string {
  return choiceLabel(vehicle).trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
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

function categoryTier(answer: Vehicle, candidate: Vehicle): number {
  if (answer.kind === 'motorcycle' && candidate.kind === 'motorcycle') {
    return candidate.style === answer.style ? 0 : 1;
  }

  if (answer.kind !== 'car' || candidate.kind !== 'car') {
    return 0;
  }

  if (!answer.bodyType || !candidate.bodyType) {
    return 2;
  }

  if (candidate.bodyType === answer.bodyType) {
    return 0;
  }

  return RELATED_BODY_TYPES[answer.bodyType]?.includes(candidate.bodyType) ? 1 : 2;
}

function displacementValue(vehicle: Vehicle): number | undefined {
  if (!vehicle.displacement) return undefined;
  return vehicle.kind === 'motorcycle'
    ? vehicle.displacement.value / 1000
    : Number(vehicle.displacement);
}

function relativeDistance(left: number | undefined, right: number | undefined): number {
  if (left === undefined || right === undefined) {
    return 0.25;
  }

  return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), 1);
}

function mismatch(left: unknown, right: unknown, penalty: number): number {
  if (left === undefined || right === undefined) {
    return penalty / 2;
  }

  return left === right ? 0 : penalty;
}

function technicalDistance(answer: Vehicle, candidate: Vehicle): number {
  let distance = Math.min(Math.abs(answer.year - candidate.year) / 8, 2.5);

  distance += relativeDistance(answer.power?.value, candidate.power?.value) * 2;
  distance += relativeDistance(answer.fipe?.value, candidate.fipe?.value) * 1.5;
  distance += relativeDistance(displacementValue(answer), displacementValue(candidate));
  distance += mismatch(answer.fuel, candidate.fuel, 0.4);
  distance += mismatch(answer.transmission, candidate.transmission, 0.25);

  if (answer.kind !== 'motorcycle' && candidate.kind !== 'motorcycle') {
    distance += mismatch(answer.aspiration, candidate.aspiration, 0.35);
  }

  if (answer.kind === 'car' && candidate.kind === 'car') {
    distance += mismatch(answer.drivetrain, candidate.drivetrain, 0.25);
    distance += mismatch(answer.doors, candidate.doors, 0.2);
  }

  if (answer.kind === 'motorcycle' && candidate.kind === 'motorcycle') {
    distance += mismatch(answer.style, candidate.style, 0.8);
    distance += mismatch(answer.engineCycle, candidate.engineCycle, 0.35);
    distance += mismatch(answer.finalDrive, candidate.finalDrive, 0.2);
  }

  return distance;
}

function uniqueByLabel(answer: Vehicle, candidates: Vehicle[]): Vehicle[] {
  const representatives = new Map<string, Vehicle>();

  for (const candidate of candidates) {
    const key = choiceKey(candidate);
    const current = representatives.get(key);

    if (!current) {
      representatives.set(key, candidate);
      continue;
    }

    const candidateTier = categoryTier(answer, candidate);
    const currentTier = categoryTier(answer, current);

    if (
      candidateTier < currentTier ||
      (candidateTier === currentTier &&
        technicalDistance(answer, candidate) < technicalDistance(answer, current))
    ) {
      representatives.set(key, candidate);
    }
  }

  return [...representatives.values()];
}

function rankBySimilarity(answer: Vehicle, candidates: Vehicle[], random: () => number): Vehicle[] {
  return candidates
    .map((vehicle) => ({
      vehicle,
      score: technicalDistance(answer, vehicle) + random() * RANDOM_VARIATION,
    }))
    .toSorted((left, right) => left.score - right.score)
    .map(({ vehicle }) => vehicle);
}

export function buildChoices(
  answer: Vehicle,
  pool: readonly Vehicle[],
  random: () => number = Math.random,
): RoundChoice[] {
  const answerKey = choiceKey(answer);

  const others = uniqueByLabel(
    answer,
    pool.filter(
      (vehicle) =>
        vehicle.kind === answer.kind &&
        vehicle.slug !== answer.slug &&
        choiceKey(vehicle) !== answerKey,
    ),
  );

  const distractors = [0, 1, 2]
    .flatMap((tier) =>
      rankBySimilarity(
        answer,
        others.filter((vehicle) => categoryTier(answer, vehicle) === tier),
        random,
      ),
    )
    .slice(0, CHOICE_COUNT - 1);

  return shuffle(
    [answer, ...distractors].map((vehicle) => ({
      id: vehicle.slug,
      label: choiceLabel(vehicle),
    })),
    random,
  );
}
