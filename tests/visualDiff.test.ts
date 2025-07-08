import { runVisualDiff } from '../src/ci/visualDiff.js';

test('runVisualDiff returns 0', () => {
  expect(runVisualDiff()).toBe(0);
});
