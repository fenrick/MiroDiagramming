import { expect, test } from 'vitest'

import { computeDiff } from '../src/board/computeDiff'

test('computes creates updates deletes', () => {
  const original = [
    { id: '1', v: 1 },
    { id: '2', v: 2 },
  ]
  const modified = [
    { id: '2', v: 3 },
    { id: '3', v: 4 },
  ]
  const diff = computeDiff(original, modified)
  expect(diff.creates).toEqual([{ id: '3', v: 4 }])
  expect(diff.updates).toEqual([{ id: '2', v: 3 }])
  expect(diff.deletes).toEqual([{ id: '1', v: 1 }])
})
