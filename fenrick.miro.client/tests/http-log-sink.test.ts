import { createServer } from 'node:http';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { HttpLogSink } from '../src/log-sink';

let server: ReturnType<typeof createServer>;
let url: string;

beforeAll(async () => {
  server = createServer((_, res) => {
    res.statusCode = 202;
    res.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as import('node:net').AddressInfo;
  url = `http://127.0.0.1:${addr.port}/api/logs`;
});

afterAll(async () => {
  server.close();
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
