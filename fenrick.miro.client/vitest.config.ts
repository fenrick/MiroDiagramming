import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      lines: 70,
      functions: 70,
      branches: 60,
    },
  },
});
