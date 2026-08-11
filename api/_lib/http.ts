const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
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
