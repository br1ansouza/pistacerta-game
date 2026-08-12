const DEV_SECRET = 'pistacerta-dev-secret';
const ROUND_TTL_MS = 6 * 60 * 60 * 1000;
const DECK_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedKey: Promise<CryptoKey> | null = null;

function getSecret(): string {
  const secret = process.env.ROUND_TOKEN_SECRET;

  if (secret && secret.length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ROUND_TOKEN_SECRET é obrigatório em produção.');
  }

  return DEV_SECRET;
}

async function deriveKey(): Promise<CryptoKey> {
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(getSecret()));

  return crypto.subtle.importKey('raw', material, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

function getKey(): Promise<CryptoKey> {
  cachedKey ??= deriveKey();
  return cachedKey;
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

async function seal(payload: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await getKey(),
    encoder.encode(JSON.stringify(payload)),
  );

  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);

  return toBase64Url(packed);
}

async function unseal(token: string): Promise<unknown> {
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
      await getKey(),
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

export async function signRoundToken(slug: string): Promise<string> {
  return seal({ t: 'round', slug, expiresAt: Date.now() + ROUND_TTL_MS });
}

export async function verifyRoundToken(token: string): Promise<RoundTokenPayload | null> {
  const payload = (await unseal(token)) as RoundTokenPayload | null;

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

const digestCache = new Map<string, string>();

async function slugDigest(slug: string): Promise<string> {
  const cached = digestCache.get(slug);

  if (cached) {
    return cached;
  }

  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(slug));
  const value = toBase64Url(new Uint8Array(hash).subarray(0, 4));
  digestCache.set(slug, value);

  return value;
}

export async function signDeckToken(
  seen: readonly string[],
  carry: readonly string[] = [],
): Promise<string> {
  const digests = await Promise.all(seen.map(slugDigest));

  return seal({ t: 'deck', d: [...digests, ...carry], expiresAt: Date.now() + DECK_TTL_MS });
}

export type DeckState = { seen: string[]; carry: string[] };

export async function readDeckDigests(
  token: string | null | undefined,
  slugs: readonly string[],
): Promise<DeckState> {
  if (!token) {
    return { seen: [], carry: [] };
  }

  const payload = (await unseal(token)) as (DeckTokenPayload & { d?: string[] }) | null;

  if (!payload || payload.t !== 'deck') {
    return { seen: [], carry: [] };
  }

  if (typeof payload.expiresAt !== 'number' || Date.now() > payload.expiresAt) {
    return { seen: [], carry: [] };
  }

  if (Array.isArray(payload.seen)) {
    return { seen: payload.seen.filter((slug) => typeof slug === 'string'), carry: [] };
  }

  if (!Array.isArray(payload.d)) {
    return { seen: [], carry: [] };
  }

  const bySlug = new Map<string, string>();
  await Promise.all(
    slugs.map(async (slug) => {
      bySlug.set(await slugDigest(slug), slug);
    }),
  );

  const seen: string[] = [];
  const carry: string[] = [];

  for (const digest of payload.d) {
    const slug = bySlug.get(digest);

    if (slug) {
      seen.push(slug);
    } else {
      carry.push(digest);
    }
  }

  return { seen, carry };
}

export async function readDeckToken(token: string | null | undefined): Promise<string[]> {
  if (!token) {
    return [];
  }

  const payload = (await unseal(token)) as DeckTokenPayload | null;

  if (!payload || payload.t !== 'deck' || !Array.isArray(payload.seen)) {
    return [];
  }

  if (typeof payload.expiresAt !== 'number' || Date.now() > payload.expiresAt) {
    return [];
  }

  return payload.seen.filter((slug) => typeof slug === 'string');
}
