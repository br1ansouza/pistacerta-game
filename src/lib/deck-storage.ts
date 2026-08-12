const STORAGE_KEY = 'pistacerta:deck';
const LEGACY_KEY = 'pistacerta:recent-rounds';

let memoryDeck: string | null = null;

function fromStorage(): string | null {
  try {
    globalThis.localStorage?.removeItem(LEGACY_KEY);

    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function readDeck(): string | null {
  return memoryDeck ?? fromStorage();
}

export function saveDeck(deck: string): void {
  memoryDeck = deck;

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, deck);
  } catch {
    return;
  }
}

export function clearDeck(): void {
  memoryDeck = null;

  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
