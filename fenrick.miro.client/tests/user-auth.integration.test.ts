import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { AuthClient, registerCurrentUser } from '../src/user-auth';

let server: ReturnType<typeof spawn>;
let url: string;

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
  url = `${addr}/api/users`;
}, 30000);

afterAll(async () => {
  server.kill();
  await once(server, 'exit');
});

test('registerCurrentUser sends token to server', async () => {
  (global as unknown as { miro: unknown }).miro = {
    board: {
      getIdToken: vi.fn().mockResolvedValue('tok'),
      getUserInfo: vi.fn().mockResolvedValue({ id: 'u1', name: 'Alice' }),
    },
  };
  const client = new AuthClient(url);
  const originalFetch = global.fetch;
  let status = 0;
  global.fetch = async (...args) => {
    const r = await originalFetch(...args);
    status = r.status;
    return r;
  };
  await registerCurrentUser(client);
  expect(status).toBe(202);
  global.fetch = originalFetch;
});
