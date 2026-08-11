import { handleHealth } from '../api/health.ts';

const PORT = Number(process.env.API_PORT ?? 3001);

type RouteHandler = (request: Request) => Promise<Response>;

const routes: Record<string, RouteHandler> = {
  '/api/health': handleHealth,
};

Bun.serve({
  port: PORT,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const handler = routes[pathname];

    if (!handler) {
      return Response.json({ error: 'Rota não encontrada' }, { status: 404 });
    }

    try {
      return await handler(request);
    } catch (error) {
      console.error(`[api] ${pathname} falhou:`, error);
      return Response.json({ error: 'Erro interno' }, { status: 500 });
    }
  },
});

console.log(`[api] escutando em http://localhost:${PORT}`);
