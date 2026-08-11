const TTL_MS = 6 * 60 * 60 * 1000;
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

export type RoundTokenPayload = {
  slug: string;
  expiresAt: number;
};

export async function signRoundToken(slug: string, secret: string): Promise<string> {
  const payload: RoundTokenPayload = { slug, expiresAt: Date.now() + TTL_MS };
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

export async function verifyRoundToken(
  token: string,
  secret: string,
): Promise<RoundTokenPayload | null> {
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

  let payload: RoundTokenPayload;

  try {
    payload = JSON.parse(decoder.decode(plaintext)) as RoundTokenPayload;
  } catch {
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

export async function slugsFromTokens(
  tokens: readonly string[],
  secret: string,
): Promise<string[]> {
  const payloads = await Promise.all(tokens.map((token) => verifyRoundToken(token, secret)));

  return payloads.flatMap((payload) => (payload ? [payload.slug] : []));
}
