module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/src/ui/',
    '/src/core/utils/color-utils.ts',
    '/src/board/',
  ],
  testMatch: ['**/tests/**/*.test.ts?(x)'],
  maxWorkers: 1,
};
