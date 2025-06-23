import { vi } from 'vitest';

// alias jest global to vitest for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

// Silence noisy console.log output from third-party libraries during tests
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
afterAll(() => {
  logSpy.mockRestore();
});
