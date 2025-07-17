import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'commitlint.config.cjs',
        'scripts/**',
        'vitest.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        'vite-env.d.ts',
        '.storybook/**',
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
          setupFiles: './fenrick.miro.ux.tests/setupTests.ts',
          environment: 'node',
          include: ['fenrick.miro.ux.tests/**/*.test.ts'],
        },
      },
      {
        test: {
          globals: true,
          setupFiles: './fenrick.miro.ux.tests/setupTests.ts',
          environment: 'jsdom',
          include: ['fenrick.miro.ux.tests/**/*.test.tsx'],
        },
      },
    ],
  },
});
