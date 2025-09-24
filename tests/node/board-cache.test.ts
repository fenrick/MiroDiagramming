import { describe, it, expect, vi } from 'vitest'

import { boardCache } from '../../src/board/board-cache'

describe('board-cache', () => {
  it('caches selection and clears on reset', async () => {
    const board = {
      getSelection: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
    } as any
    const first = await boardCache.getSelection(board)
    expect(first.length).toBe(2)
    // Second call uses cache
    board.getSelection.mockResolvedValue([{ id: 'x' }])
    const second = await boardCache.getSelection(board)
    expect(second.length).toBe(2)
    boardCache.reset()
    const third = await boardCache.getSelection(board)
    expect(third.length).toBe(1)
  })

  it('fetches missing widget types and caches them', async () => {
    const board = {
      get: vi.fn(async ({ type }: { type: string }) => [{ id: `${type}-1` }]),
      getSelection: vi.fn(),
    } as any
    const res1 = await boardCache.getWidgets(['shape', 'card'], board)
    expect(res1.map((i) => i.id)).toEqual(['shape-1', 'card-1'])
    // Subsequent call should hit cache and not call get again
    board.get.mockRejectedValue(new Error('should not be called'))
    const res2 = await boardCache.getWidgets(['shape'], board)
    expect(res2.map((i) => i.id)).toEqual(['shape-1'])
    boardCache.reset()
  })
})

