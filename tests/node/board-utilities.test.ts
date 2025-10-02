import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { boardCache } from '../../src/board/board-cache'
import {
  ensureBoard,
  forEachSelection,
  getBoard,
  getBoardWithQuery,
  getFirstSelection,
  maybeSync,
} from '../../src/board/board'
import type { BoardLike, BoardQueryLike } from '../../src/board/types'

vi.mock('../../src/ui/hooks/notifications', () => ({
  showError: vi.fn(() => Promise.resolve()),
}))

describe('board utilities', () => {
  const selection: Record<string, unknown>[] = [{ id: 'a' }, { id: 'b' }]

  const createBoard = (): BoardLike => ({
    getSelection: vi.fn<BoardLike['getSelection']>().mockResolvedValue(selection),
  })

  const createQueryBoard = (): BoardQueryLike => ({
    get: vi.fn<BoardQueryLike['get']>().mockResolvedValue([]),
    getSelection: vi.fn<BoardLike['getSelection']>().mockResolvedValue(selection),
  })

  beforeEach(() => {
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(selection)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })

  it('getBoard prefers parameter and throws without board', () => {
    const board = createBoard()

    expect(getBoard(board)).toBe(board)

    const previousMiro = (globalThis as Record<string, unknown>).miro
    ;(globalThis as Record<string, unknown>).miro = undefined
    expect(() => getBoard()).toThrow('Miro board not available')
    ;(globalThis as Record<string, unknown>).miro = previousMiro
  })

  it('getBoardWithQuery casts board for query methods', () => {
    const queryBoard = createQueryBoard()

    const castBoard = getBoardWithQuery(queryBoard)
    expect(typeof castBoard.get).toBe('function')
  })

  it('ensureBoard returns undefined when no board and shows error', () => {
    const previousMiro = (globalThis as Record<string, unknown>).miro
    ;(globalThis as Record<string, unknown>).miro = undefined
    const result = ensureBoard()
    expect(result).toBeUndefined()
    ;(globalThis as Record<string, unknown>).miro = previousMiro
  })

  it('getFirstSelection returns first item', async () => {
    const first = await getFirstSelection(createBoard())
    expect(first).toEqual({ id: 'a' })
  })

  it('forEachSelection invokes callback for each', async () => {
    const callback = vi.fn<(item: Record<string, unknown>) => void>()
    await forEachSelection(callback, createBoard())
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('maybeSync calls sync when present', async () => {
    const sync = vi.fn<() => Promise<void>>(() => Promise.resolve())
    await maybeSync({ sync })
    expect(sync).toHaveBeenCalled()
  })
})
