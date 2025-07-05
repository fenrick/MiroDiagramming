import { vi, afterEach } from 'vitest';

// alias jest global to vitest for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

// Silence noisy console output from third-party libraries during tests
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Reset mocks and clean up globals after every test
afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as { miro?: unknown }).miro;
});

afterAll(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});
