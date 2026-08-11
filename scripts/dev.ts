import process from 'node:process';

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
