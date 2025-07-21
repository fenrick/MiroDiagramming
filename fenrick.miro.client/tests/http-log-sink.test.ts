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
  url = `${addr}/api/logs`;
}, 30000);

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
