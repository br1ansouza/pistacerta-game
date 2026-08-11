import process from 'node:process';

const API_PORT = Number(process.env.API_PORT ?? 3001);
const WEB_PORT = Number(process.env.PORT ?? 3000);

async function findBlockingPort(): Promise<number | null> {
  for (const port of [API_PORT, WEB_PORT]) {
    try {
      const probe = Bun.listen({
        port,
        hostname: '0.0.0.0',
        socket: { data() {} },
      });
      probe.stop(true);
    } catch {
      return port;
    }
  }

  return null;
}

const blocked = await findBlockingPort();

if (blocked !== null) {
  console.error(`\nPorta ${blocked} já está em uso.\n`);
  console.error('Provavelmente sobrou um processo de uma execução anterior. Para ver e encerrar:');
  console.error(`  lsof -i :${blocked}`);
  console.error(`  kill $(lsof -t -i :${blocked})\n`);
  console.error('Ou rode em outras portas:');
  console.error(`  PORT=3010 API_PORT=3011 bun run dev\n`);
  process.exit(1);
}

const children = [
  Bun.spawn(['bun', 'run', 'dev:api'], { stdio: ['inherit', 'inherit', 'inherit'] }),
  Bun.spawn(['bun', 'run', 'dev:web'], { stdio: ['inherit', 'inherit', 'inherit'] }),
];

let stopping = false;

function stop() {
  if (stopping) {
    return;
  }

  stopping = true;

  for (const child of children) {
    child.kill();
  }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', stop);

await Promise.race(children.map((child) => child.exited));
stop();
