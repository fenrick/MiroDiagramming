import { tokensVerify } from '../src/ci/tokenVerify.js';

test('tokensVerify returns 0', () => {
  expect(tokensVerify()).toBe(0);
});
