const STORAGE_KEY = 'pistacerta:deck';
const LEGACY_KEY = 'pistacerta:recent-rounds';

export function readDeck(): string | null {
  try {
    globalThis.localStorage?.removeItem(LEGACY_KEY);

    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function saveDeck(deck: string): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, deck);
  } catch {
    return;
  }
}

export function clearDeck(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
