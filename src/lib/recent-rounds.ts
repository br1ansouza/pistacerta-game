const STORAGE_KEY = 'pistacerta:recent-rounds';
const MAX_ENTRIES = 12;

export function readRecentTokens(): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberToken(token: string): void {
  try {
    const next = [token, ...readRecentTokens().filter((item) => item !== token)].slice(
      0,
      MAX_ENTRIES,
    );

    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}
