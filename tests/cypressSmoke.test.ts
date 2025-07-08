import { runCypressSmoke } from '../src/ci/cypressSmoke.js';
import { vi } from 'vitest';

test('returns 0 when cypress succeeds', () => {
  const exec = vi.fn();
  expect(runCypressSmoke('spec', exec)).toBe(0);
  expect(exec).toHaveBeenCalled();
});

test('returns 1 on failure', () => {
  const exec = vi.fn(() => {
    throw new Error('fail');
  });
  expect(runCypressSmoke('spec', exec)).toBe(1);
});
