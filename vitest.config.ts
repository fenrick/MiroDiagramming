import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '../src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Global defaults (coverage etc.)
  test: {
    globals: true,
    passWithNoTests: true,
    include: [],
    exclude: ['tests/client/preview-config.test.tsx'],
    threads: false,
    coverage: {
      // Coverage is off by default; enabled via `--coverage` or `npm run coverage`.
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/__mocks__/**', 'src/**/__fixtures__/**'],
    },
  },
  // Per-project environments
  projects: [
    {
      test: {
        name: 'node',
        environment: 'node',
        include: ['tests/**/*.test.ts'],
      },
    },
    {
      test: {
        name: 'jsdom',
        environment: 'jsdom',
        setupFiles: ['tests/client/setupTests.ts'],
        include: ['tests/client/**/*.test.tsx'],
      },
    },
  ],
})
