import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: { alias: { 'fenrick.miro.client': path.resolve(__dirname, 'src') } },
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      exclude: [
        'commitlint.config.cjs',
        'scripts/**',
        'vitest.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        '.storybook/**',
        'src/stories/**',
        'src/core/excel-sync-service.ts',
        'src/board/item-types.ts',
        'src/board/types.ts',
        '**/*.d.ts',
      ],
    },
    reporters: [
      'default',
      [
        'junit',
        { outputFile: 'coverage/sonar-report.xml', suiteName: 'vitest' },
      ],
    ],
    projects: [
      {
        test: {
          globals: true,
          setupFiles: './tests/setupTests.ts',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
        },
      },
      {
        test: {
          globals: true,
          setupFiles: './tests/setupTests.ts',
          environment: 'jsdom',
          include: ['tests/**/*.test.tsx'],
        },
      },
    ],
  },
});
