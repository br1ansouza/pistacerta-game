const LEGACY_KEYS = ['pistacerta:recent-rounds', 'pistacerta:deck'];

const memoryDecks = new Map<string, string>();

function storageKey(kind: string): string {
  return `pistacerta:deck:${kind}`;
}

export function readDeck(kind: string): string | null {
  try {
    for (const key of LEGACY_KEYS) {
      globalThis.localStorage?.removeItem(key);
    }

    return memoryDecks.get(kind) ?? globalThis.localStorage?.getItem(storageKey(kind)) ?? null;
  } catch {
    return memoryDecks.get(kind) ?? null;
  }
}

export function saveDeck(kind: string, deck: string): void {
  memoryDecks.set(kind, deck);

  try {
    globalThis.localStorage?.setItem(storageKey(kind), deck);
  } catch {
    return;
  }
}
