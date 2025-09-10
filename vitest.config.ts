import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
