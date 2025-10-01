import { describe, it, expect, vi, afterEach } from 'vitest'
import { LRUCache } from 'lru-cache'
import type { BaseItem } from '@mirohq/websdk-types'

import { searchShapes, searchGroups } from '../../src/board/node-search'
import { boardCache } from '../../src/board/board-cache'

describe('node-search', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })
  it('searchShapes uses cache when provided', async () => {
    const cache = new LRUCache<string, BaseItem>({ max: 10 })
    cache.set('Label', { id: 's1', content: 'Label' } as unknown as BaseItem)
    const res = await searchShapes({} as any, cache, 'Label')
    expect((res as { id?: string } | undefined)?.id).toBe('s1')
  })

  it('searchShapes builds cache from board when missing', async () => {
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([{ content: 'X' }] as any)
    const res = await searchShapes({ get: vi.fn() } as any, undefined, 'X')
    expect((res as { content?: string } | undefined)?.content).toBe('X')
  })

  it('searchGroups scans group children for matching label', async () => {
    const group = {
      getItems: vi.fn().mockResolvedValue([{ content: 'Match' }]),
    }
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([group as any])
    const res = await searchGroups({ get: vi.fn() } as any, 'type', 'Match')
    expect(res).toBe(group)
  })
})
