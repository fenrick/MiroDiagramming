import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '../src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Single project: default Node environment. Use per-file directive for jsdom
    // e.g. add `// @vitest-environment jsdom` at the top of client test files.
    environment: 'node',
    globals: true,
    passWithNoTests: true,
    threads: false,
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/client/preview-config.test.tsx'],
    setupFiles: ['tests/client/setupTests.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      // Capture coverage for every module under src so local reports match Sonar's scope.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/__mocks__/**', 'src/**/__fixtures__/**'],
    },
  },
})
