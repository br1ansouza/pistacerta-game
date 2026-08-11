import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; vehicleCount: number }
  | { status: 'error'; message: string };

export function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  const checkHealth = useCallback(async (signal?: AbortSignal) => {
    setHealth({ status: 'loading' });

    try {
      const response = await fetch('/api/health', { signal });

      if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
      }

      const body = (await response.json()) as { vehicleCount: number };
      setHealth({ status: 'ok', vehicleCount: body.vehicleCount });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setHealth({
        status: 'error',
        message: error instanceof Error ? error.message : 'Falha desconhecida',
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void checkHealth(controller.signal);
    return () => controller.abort();
  }, [checkHealth]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-brand-secondary text-sm font-semibold tracking-widest uppercase">
          Qual é?
        </p>
        <h1 className="text-primary text-display-sm font-bold">PistaCerta</h1>
        <p className="text-tertiary text-md text-balance">
          Descubra o carro a partir das pistas. Uma de cada vez.
        </p>
      </header>

      <section
        aria-live="polite"
        className="border-secondary bg-secondary flex flex-col gap-3 rounded-2xl border p-5"
      >
        {health.status === 'loading' && <p className="text-tertiary text-sm">Verificando a API…</p>}

        {health.status === 'ok' && (
          <p className="text-secondary text-sm">
            API no ar — <span className="text-primary font-semibold">{health.vehicleCount}</span>{' '}
            veículos cadastrados.
          </p>
        )}

        {health.status === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-error-primary text-sm">API indisponível: {health.message}</p>
            <p className="text-tertiary text-xs">
              Rode <code className="font-mono">bun run dev:api</code> em outro terminal.
            </p>
            <Button size="sm" color="secondary" onClick={() => void checkHealth()}>
              Tentar de novo
            </Button>
          </div>
        )}
      </section>

      <footer className="text-quaternary text-xs">
        Fase 1 — estrutura do projeto. O jogo ainda não começou.
      </footer>
    </main>
  );
}
