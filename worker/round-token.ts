const ROUND_TTL_MS = 6 * 60 * 60 * 1000;
const DECK_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyCache = new Map<string, Promise<CryptoKey>>();

async function deriveKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(secret));

  return crypto.subtle.importKey('raw', material, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

function getKey(secret: string): Promise<CryptoKey> {
  const cached = keyCache.get(secret);

  if (cached) {
    return cached;
  }

  const created = deriveKey(secret);
  keyCache.set(secret, created);

  return created;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (const [index, char] of [...binary].entries()) {
    bytes[index] = char.charCodeAt(0);
  }

  return bytes;
}

async function seal(payload: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await getKey(secret),
    encoder.encode(JSON.stringify(payload)),
  );

  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);

  return toBase64Url(packed);
}

async function unseal(token: string, secret: string): Promise<unknown> {
  let packed: Uint8Array<ArrayBuffer>;

  try {
    packed = fromBase64Url(token);
  } catch {
    return null;
  }

  if (packed.length <= IV_BYTES) {
    return null;
  }

  let plaintext: ArrayBuffer;

  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: packed.subarray(0, IV_BYTES) },
      await getKey(secret),
      packed.subarray(IV_BYTES),
    );
  } catch {
    return null;
  }

  try {
    return JSON.parse(decoder.decode(plaintext));
  } catch {
    return null;
  }
}

export type RoundTokenPayload = {
  t?: 'round';
  slug: string;
  expiresAt: number;
};

type DeckTokenPayload = {
  t: 'deck';
  seen: string[];
  expiresAt: number;
};

export async function signRoundToken(slug: string, secret: string): Promise<string> {
  return seal({ t: 'round', slug, expiresAt: Date.now() + ROUND_TTL_MS }, secret);
}

export async function verifyRoundToken(
  token: string,
  secret: string,
): Promise<RoundTokenPayload | null> {
  const payload = (await unseal(token, secret)) as RoundTokenPayload | null;

  if (!payload || (payload.t !== undefined && payload.t !== 'round')) {
    return null;
  }

  if (typeof payload.slug !== 'string' || typeof payload.expiresAt !== 'number') {
    return null;
  }

  if (Date.now() > payload.expiresAt) {
    return null;
  }

  return payload;
}

export async function signDeckToken(seen: readonly string[], secret: string): Promise<string> {
  return seal({ t: 'deck', seen: [...seen], expiresAt: Date.now() + DECK_TTL_MS }, secret);
}

export async function readDeckToken(
  token: string | null | undefined,
  secret: string,
): Promise<string[]> {
  if (!token) {
    return [];
  }

  const payload = (await unseal(token, secret)) as DeckTokenPayload | null;

  if (!payload || payload.t !== 'deck' || !Array.isArray(payload.seen)) {
    return [];
  }

  if (typeof payload.expiresAt !== 'number' || Date.now() > payload.expiresAt) {
    return [];
  }

  return payload.seen.filter((slug) => typeof slug === 'string');
}
