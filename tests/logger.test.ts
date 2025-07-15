import { afterEach, expect, test, vi } from 'vitest';

const ORIG_LEVEL = process.env.LOG_LEVEL;

afterEach(() => {
  process.env.LOG_LEVEL = ORIG_LEVEL;
  vi.resetModules();
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
