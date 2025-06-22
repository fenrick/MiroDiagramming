module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/src/ui/',
    '/src/core/utils/color-utils.ts',
    '/src/board/',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testMatch: ['**/tests/**/*.test.ts?(x)'],
  maxWorkers: 1,
};
