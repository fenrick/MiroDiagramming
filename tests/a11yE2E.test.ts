import { runA11yChecks } from '../src/ci/a11yE2E.js';
import { vi } from 'vitest';

test('returns 0 when cypress succeeds', () => {
  const exec = vi.fn();
  expect(runA11yChecks('spec', exec)).toBe(0);
  expect(exec).toHaveBeenCalled();
});

test('returns 1 on failure', () => {
  const exec = vi.fn(() => {
    throw new Error('fail');
  });
  expect(runA11yChecks('spec', exec)).toBe(1);
});
