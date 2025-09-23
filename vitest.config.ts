import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '../src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    passWithNoTests: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/client/preview-config.test.tsx'],
    threads: false,
    // Default to Node; switch to jsdom for client tests via globs
    environment: 'node',
    environmentMatchGlobs: [['tests/client/**', 'jsdom']],
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
  projects: [],
})
