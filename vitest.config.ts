import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '../src': fileURLToPath(new URL('./src/frontend', import.meta.url)),
    },
  },
  test: {
    // Default to Node; switch to jsdom for client tests via globs below
    environment: 'node',
    environmentMatchGlobs: [['tests/client/**', 'jsdom']],
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/client/preview-config.test.tsx'],
    setupFiles: ['tests/client/setupTests.ts'],
    threads: false,
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
      },
      include: [
        'src/app.ts',
        'src/server.ts',
        'src/config/**/*.ts',
        'src/miro/**/*.ts',
        'src/queue/**/*.ts',
        'src/repositories/**/*.ts',
        'src/routes/**/*.ts',
        'src/services/**/*.ts',
        'src/utils/**/*.ts',
        'src/types/**/*.ts',
        'src/frontend/**/*.ts',
        'src/frontend/**/*.tsx',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'src/web/**',
        'src/miro_backend/**',
        '**/*.d.ts',
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
