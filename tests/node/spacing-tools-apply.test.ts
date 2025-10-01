import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { applySpacingLayout } from '../../src/board/spacing-tools'
import { boardCache } from '../../src/board/board-cache'

describe('spacing-tools applySpacingLayout', () => {
  const selection = [
    { id: 'a', x: 0, y: 0, width: 10, height: 10 },
    { id: 'b', x: 20, y: 0, width: 10, height: 10 },
    { id: 'c', x: 40, y: 0, width: 10, height: 10 },
  ] as Array<Record<string, any>>

  beforeEach(() => {
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(selection)
  })
  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })

  it('moves items to keep equal spacing (move mode)', async () => {
    await applySpacingLayout({ axis: 'x', spacing: 5, mode: 'move' }, {} as any)
    // Positions become evenly spaced: 0, 15, 30
    expect(selection[0]!.x).toBeCloseTo(0)
    expect(selection[1]!.x).toBeCloseTo(15)
    expect(selection[2]!.x).toBeCloseTo(30)
  })

  it('grows items to maintain outer edges (grow mode)', async () => {
    // Reset
    selection[0]!.x = 0
    selection[1]!.x = 20
    selection[2]!.x = 40

    await applySpacingLayout({ axis: 'x', spacing: 5, mode: 'grow' }, {} as any)
    // All items share the same width; outer edges preserved
    const w0 = selection[0]!.width
    const w1 = selection[1]!.width
    const w2 = selection[2]!.width
    expect(w0).toBeGreaterThan(0)
    expect(w0).toBe(w1)
    expect(w1).toBe(w2)
  })
})
