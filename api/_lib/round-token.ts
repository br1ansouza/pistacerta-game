const DEV_SECRET = 'pistacerta-dev-secret';
const TTL_MS = 6 * 60 * 60 * 1000;
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

export type RoundTokenPayload = {
  slug: string;
  expiresAt: number;
};

export async function signRoundToken(slug: string): Promise<string> {
  const payload: RoundTokenPayload = { slug, expiresAt: Date.now() + TTL_MS };
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

export async function verifyRoundToken(token: string): Promise<RoundTokenPayload | null> {
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

export async function slugsFromTokens(tokens: readonly string[]): Promise<string[]> {
  const payloads = await Promise.all(tokens.map((token) => verifyRoundToken(token)));

  return payloads.flatMap((payload) => (payload ? [payload.slug] : []));
}
