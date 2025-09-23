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
    threads: false,
    include: [],
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/__mocks__/**', 'src/**/__fixtures__/**'],
    },
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/client/preview-config.test.tsx'],
        },
      },
      {
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: ['tests/client/setupTests.ts'],
          include: ['tests/client/**/*.test.tsx', 'src/**/*.test.tsx'],
          exclude: ['tests/client/preview-config.test.tsx'],
        },
      },
    ],
  },
})
