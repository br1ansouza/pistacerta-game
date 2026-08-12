const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...extraHeaders } });
}

function deckCookieName(kind: string): string {
  return `pc_deck_${kind}`;
}

export function deckCookie(kind: string, deck: string): string {
  return `${deckCookieName(kind)}=${deck}; Path=/; Max-Age=${180 * 24 * 60 * 60}; SameSite=Lax`;
}

export function deckFromCookie(request: Request, kind: string): string | null {
  const header = request.headers.get('cookie');

  if (!header) {
    return null;
  }

  const wanted = deckCookieName(kind);

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');

    if (name === wanted && rest.length > 0) {
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
