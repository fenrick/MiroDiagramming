import { afterEach, expect, test, vi } from 'vitest';
import { HttpLogSink } from '../src/log-sink';

const ORIG_LEVEL = process.env.LOG_LEVEL;
const ORIG_ENV = process.env.NODE_ENV;

afterEach(() => {
  process.env.LOG_LEVEL = ORIG_LEVEL;
  process.env.NODE_ENV = ORIG_ENV;
  vi.resetModules();
  delete (global as { fetch?: unknown }).fetch;
});

vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
});

test('defaults to info level', async () => {
  delete process.env.LOG_LEVEL;
  const { log } = await import('../src/logger');
  expect(log.level).toBe('info');
});

test('respects LOG_LEVEL environment variable', async () => {
  process.env.LOG_LEVEL = 'trace';
  const { log } = await import('../src/logger');
  expect(log.level).toBe('trace');
});

test('forwards log entries to sink', async () => {
  process.env.LOG_LEVEL = 'info';
  process.env.NODE_ENV = 'development';
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
  const sink = new HttpLogSink('/test');
  const { createLogger } = await import('../src/logger');
  const logger = createLogger(sink);
  logger.info('hello');
  expect(global.fetch).toHaveBeenCalledWith(
    '/test',
    expect.objectContaining({ method: 'POST' }),
  );
});
