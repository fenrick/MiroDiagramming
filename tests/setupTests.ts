import { jest } from '@jest/globals';

// Silence noisy console.log output from third-party libraries during tests
const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
afterAll(() => {
  logSpy.mockRestore();
});
