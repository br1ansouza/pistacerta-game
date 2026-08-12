const CARRY_OVER = 8;
const MAX_SEEN = 250;
const BRAND_PENALTY = 0.18;
const DECADE_PENALTY = 0.55;

export type DeckCandidate = {
  slug: string;
  brand: string;
  year: number;
};

export type DeckPick<V extends DeckCandidate> = {
  vehicle: V;
  seen: string[];
  reshuffled: boolean;
};

function weightsFor<V extends DeckCandidate>(pool: readonly V[], recent: readonly V[]): number[] {
  const recentBrands = recent.map((vehicle) => vehicle.brand);
  const recentDecades = new Set(recent.slice(0, 3).map((vehicle) => Math.floor(vehicle.year / 10)));

  return pool.map((vehicle) => {
    let weight = 1;

    const brandIndex = recentBrands.indexOf(vehicle.brand);
    if (brandIndex !== -1) {
      weight *= BRAND_PENALTY * (1 + brandIndex / recentBrands.length);
    }

    if (recentDecades.has(Math.floor(vehicle.year / 10))) {
      weight *= DECADE_PENALTY;
    }

    return Math.max(weight, 0.02);
  });
}

function weightedPick<V>(pool: readonly V[], weights: readonly number[]): V {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * total;

  for (const [index, item] of pool.entries()) {
    cursor -= weights[index] ?? 0;

    if (cursor <= 0) {
      return item;
    }
  }

  return pool.at(-1) as V;
}

export function pickFromDeck<V extends DeckCandidate>(
  pool: readonly V[],
  seen: readonly string[],
): DeckPick<V> | null {
  if (pool.length === 0) {
    return null;
  }

  const known = new Set(pool.map((vehicle) => vehicle.slug));
  const history = seen.filter((slug) => known.has(slug));

  let base = history;
  let available = pool.filter((vehicle) => !new Set(base).has(vehicle.slug));
  let reshuffled = false;

  if (available.length === 0) {
    reshuffled = true;
    base = history.slice(0, Math.min(CARRY_OVER, pool.length - 1));
    const carried = new Set(base);
    available = pool.filter((vehicle) => !carried.has(vehicle.slug));
  }

  const recent = base
    .slice(0, 6)
    .map((slug) => pool.find((vehicle) => vehicle.slug === slug))
    .filter((vehicle): vehicle is V => vehicle !== undefined);

  const vehicle = weightedPick(available, weightsFor(available, recent));

  return {
    vehicle,
    seen: [vehicle.slug, ...base.filter((slug) => slug !== vehicle.slug)].slice(0, MAX_SEEN),
    reshuffled,
  };
}
