import { afterAll, beforeAll, expect } from 'vitest';
import { HttpLogSink } from '../src/log-sink';

let server: ReturnType<typeof createServer>;
let url: string;

beforeAll(async () => {
  server = createServer((_, res) => {
    res.statusCode = 202;
    res.end();
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  url = `http://127.0.0.1:${port}/api/logs`;
}, 30000);

afterAll(async () => server.close());

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
