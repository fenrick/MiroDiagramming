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
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/client/preview-config.test.tsx'],
    setupFiles: ['tests/client/setupTests.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      all: true,
      // Focus coverage on high-signal, testable seams; expand over time.
      include: [
        'src/logger.ts',
        'src/core/utils/{aspect-ratio,base64,color-utils,debug-flags,string-utils,text-utils,unit-utils}.ts',
        'src/core/hooks/use{FocusTrap,Keybinding,OptimisticOps}.ts',
        'src/ui/hooks/{ui-utils,notifications,use-excel-sync}.ts',
        'src/ui/components/Toast.tsx',
        'src/ui/style-presets.ts',
        'src/board/{format-tools,style-tools,templates}.ts',
      ],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/__mocks__/**', 'src/**/__fixtures__/**'],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 60,
      },
    },
  },
})
