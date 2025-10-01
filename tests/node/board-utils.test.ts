import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { boardCache } from '../../src/board/board-cache'
import {
  forEachSelection,
  getBoard,
  getBoardWithQuery,
  ensureBoard,
  getFirstSelection,
  maybeSync,
} from '../../src/board/board'

vi.mock('../../src/ui/hooks/notifications', () => ({
  showError: vi.fn().mockResolvedValue(undefined),
}))

describe('board utils', () => {
  const selection = [{ id: 'a' }, { id: 'b' }]
  beforeEach(() => {
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(selection as any)
  })
  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })

  it('getBoard prefers parameter and throws without board', () => {
    const b = { x: 1 } as any
    expect(getBoard(b)).toBe(b)
    // No override and no global
    const prev = (globalThis as any).miro
    ;(globalThis as any).miro = undefined
    expect(() => getBoard()).toThrow()
    ;(globalThis as any).miro = prev
  })

  it('getBoardWithQuery casts board for query methods', () => {
    const b = { get: vi.fn() } as any
    const q = getBoardWithQuery(b)
    expect(typeof q.get).toBe('function')
  })

  it('ensureBoard returns undefined when no board and shows error', async () => {
    const prev = (globalThis as any).miro
    ;(globalThis as any).miro = undefined
    const result = ensureBoard()
    expect(result).toBeUndefined()
    ;(globalThis as any).miro = prev
  })

  it('getFirstSelection returns first item', async () => {
    const first = await getFirstSelection({} as any)
    expect(first).toEqual({ id: 'a' })
  })

  it('forEachSelection invokes callback for each', async () => {
    const cb = vi.fn()
    await forEachSelection(cb, {} as any)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('maybeSync calls sync when present', async () => {
    const sync = vi.fn().mockResolvedValue(undefined)
    await maybeSync({ sync })
    expect(sync).toHaveBeenCalled()
  })
})
