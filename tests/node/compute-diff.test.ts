import { describe, it, expect } from 'vitest'

import { computeDiff } from '../../src/board/computeDiff'

describe('computeDiff', () => {
  it('classifies creates, updates, and deletes', () => {
    const original = [
      { id: 'a', val: 1 },
      { id: 'b', val: 2 },
    ]
    const modified = [
      { id: 'b', val: 3 }, // update
      { id: 'c', val: 4 }, // create
    ]
    const res = computeDiff(original, modified)
    expect(res.creates).toEqual([{ id: 'c', val: 4 }])
    expect(res.updates).toEqual([{ id: 'b', val: 3 }])
    expect(res.deletes).toEqual([{ id: 'a', val: 1 }])
  })
})
