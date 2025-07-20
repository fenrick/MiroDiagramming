import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { HttpLogSink } from '../src/log-sink';

declare let process: NodeJS.Process;

let server: ReturnType<typeof spawn>;
let url: string;
const originalEnv = process.env.NODE_ENV;

beforeAll(async () => {
  server = spawn(
    'dotnet',
    [
      'run',
      '--project',
      path.join('fenrick.miro.server'),
      '--no-launch-profile',
    ],
    {
      cwd: path.resolve(__dirname, '..', '..'),
      env: {
        ...process.env,
        ASPNETCORE_URLS: 'http://127.0.0.1:0',
        ASPNETCORE_ENVIRONMENT: 'Development',
      },
    },
  );
  const addr = await new Promise<string>((resolve, reject) => {
    const onData = (data: Buffer) => {
      const match = /Now listening on: (http:\/\/[^\s]+)/.exec(data.toString());
      if (match) {
        server.stdout.off('data', onData);
        resolve(match[1]);
      }
    };
    server.stdout.on('data', onData);
    server.once('error', reject);
    server.once('exit', code =>
      reject(new Error(`server exited with code ${code}`)),
    );
  });
  url = `${addr}/api/logs`;
});

afterAll(async () => {
  process.env.NODE_ENV = originalEnv;
  server.kill();
  await once(server, 'exit');
});

test('HttpLogSink posts log entries to backend', async () => {
  const entry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'pong',
  };
  let status = 0;
  const originalFetch = global.fetch;
  global.fetch = async (...args) => {
    const res = await originalFetch(...args);
    status = res.status;
    return res;
  };

  process.env.NODE_ENV = 'development';
  const sink = new HttpLogSink(url);
  await sink.store([entry]);

  expect(status).toBe(202);

  global.fetch = originalFetch;
});
