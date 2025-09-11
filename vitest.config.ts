import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    threads: false,
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
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
        'src/types/**/*.ts'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'src/frontend/**',
        'src/web/**',
        'src/miro_backend/**',
        '**/*.d.ts',
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
