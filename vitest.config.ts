import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
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
