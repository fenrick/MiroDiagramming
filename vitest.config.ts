import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
    reporters: [
      'default',
      [
        'junit',
        { outputFile: 'coverage/sonar-report.xml', suiteName: 'vitest' },
      ],
    ],
  },
});
