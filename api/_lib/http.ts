const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...extraHeaders } });
}

export const DECK_COOKIE = 'pc_deck';

export function deckCookie(deck: string): string {
  return `${DECK_COOKIE}=${deck}; Path=/; Max-Age=${180 * 24 * 60 * 60}; SameSite=Lax`;
}

export function deckFromCookie(request: Request): string | null {
  const header = request.headers.get('cookie');

  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');

    if (name === DECK_COOKIE && rest.length > 0) {
      return rest.join('=');
    }
  }

  return null;
}

export function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

export async function readJsonBody<T>(request: Request): Promise<T | null> {
  if (request.method !== 'POST') {
    return null;
  }

  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
