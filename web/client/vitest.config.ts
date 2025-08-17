import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setupTests.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      lines: 70,
      functions: 70,
      branches: 60,
    },
  },
});
