import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', ['lcov', {"projectRoot": "../"}]],
      reportOnFailure: true,
      reportsDirectory: 'coverage',
      exclude: [
        'commitlint.config.cjs',
        'scripts/**',
        'vitest.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        '.storybook/**',
        'src/stories/**',
        '**/*.d.ts',
      ],
    },
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
