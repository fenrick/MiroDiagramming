import { describe, it, expect, vi } from 'vitest'

import { searchShapes, searchGroups } from '../../src/board/node-search'
import { boardCache } from '../../src/board/board-cache'

describe('node-search', () => {
  it('searchShapes uses cache when provided', async () => {
    const cache = new Map<string, any>([['Label', { id: 's1', content: 'Label' }]])
    const res = await searchShapes({} as any, cache, 'Label')
    expect(res?.id).toBe('s1')
  })

  it('searchShapes builds cache from board when missing', async () => {
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([{ content: 'X' }] as any)
    const res = await searchShapes({ get: vi.fn() } as any, undefined, 'X')
    expect(res?.content).toBe('X')
    boardCache.reset()
  })

  it('searchGroups scans group children for matching label', async () => {
    const group = {
      getItems: vi.fn().mockResolvedValue([{ content: 'Match' }]),
    }
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([group as any])
    const res = await searchGroups({ get: vi.fn() } as any, 'type', 'Match')
    expect(res).toBe(group)
    boardCache.reset()
  })
})

