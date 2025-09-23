import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '../src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    name: 'node',
    environment: 'node',
    globals: true,
    passWithNoTests: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/client/preview-config.test.tsx'],
    threads: false,
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/__mocks__/**', 'src/**/__fixtures__/**'],
    },
  },
})
