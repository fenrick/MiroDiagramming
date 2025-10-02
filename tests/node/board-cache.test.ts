import { afterEach, describe, expect, it, vi } from 'vitest'

import { boardCache } from '../../src/board/board-cache'
import type { BoardLike, BoardQueryLike } from '../../src/board/types'

describe('board-cache', () => {
  afterEach(() => {
    boardCache.reset()
  })

  it('caches selection and clears on reset', async () => {
    const getSelection = vi
      .fn<BoardLike['getSelection']>()
      .mockResolvedValue([{ id: '1' }, { id: '2' }])
    const board: BoardLike = {
      getSelection,
    }

    const initialSelection = await boardCache.getSelection(board)
    expect(initialSelection).toHaveLength(2)

    // Second call should use the cached selection
    getSelection.mockResolvedValue([{ id: 'x' }])
    const cachedSelection = await boardCache.getSelection(board)
    expect(cachedSelection).toHaveLength(2)

    boardCache.reset()

    const refreshedSelection = await boardCache.getSelection(board)
    expect(refreshedSelection).toHaveLength(1)
  })

  it('fetches missing widget types and caches them', async () => {
    const getSelection = vi.fn<BoardLike['getSelection']>()
    const get = vi
      .fn<BoardQueryLike['get']>()
      .mockImplementation(({ type }) => Promise.resolve([{ id: `${type}-1` }]))
    const board: BoardQueryLike = {
      get,
      getSelection,
    }

    const firstResult = await boardCache.getWidgets(['shape', 'card'], board)
    expect(firstResult.map((item) => item.id)).toEqual(['shape-1', 'card-1'])

    // Subsequent call should hit cache and avoid new queries
    get.mockRejectedValue(new Error('should not be called'))
    const cachedResult = await boardCache.getWidgets(['shape'], board)
    expect(cachedResult.map((item) => item.id)).toEqual(['shape-1'])
  })
})
