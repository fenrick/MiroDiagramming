import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  applySizeToSelection,
  copySizeFromSelection,
  scaleSelection,
} from '../../src/board/resize-tools'
import { boardCache } from '../../src/board/board-cache'

describe('resize-tools', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })

  it('copies size from first selection', async () => {
    const items = [{ width: 11, height: 22 }]
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(items as any)
    const size = await copySizeFromSelection({} as any)
    expect(size).toEqual({ width: 11, height: 22 })
  })

  it('applies size to selection', async () => {
    const items = [
      { width: 10, height: 10, sync: vi.fn() },
      { width: 2, height: 3, sync: vi.fn() },
    ]
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(items as any)
    await applySizeToSelection({ width: 5, height: 6 }, {} as any)
    expect(items[0]).toMatchObject({ width: 5, height: 6 })
    expect(items[1]).toMatchObject({ width: 5, height: 6 })
  })

  it('scales selection by factor', async () => {
    const items = [{ width: 10, height: 10, sync: vi.fn() }]
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(items as any)
    await scaleSelection(2, {} as any)
    expect(items[0]).toMatchObject({ width: 20, height: 20 })
  })
})
