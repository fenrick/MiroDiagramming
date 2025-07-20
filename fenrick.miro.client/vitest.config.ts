import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { 'fenrick.miro.client': path.resolve(__dirname, 'src') } },
  plugins: [react()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: [
        'text',
        ['lcov', { projectRoot: '../../' }],
        'json',
        'cobertura',
      ],
      reportsDirectory: 'coverage',
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
