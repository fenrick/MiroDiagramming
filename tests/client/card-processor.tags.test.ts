import { beforeEach, expect, test, vi } from 'vitest'
import type { Tag } from '@mirohq/websdk-types'

import { CardProcessor } from '../src/board/card-processor'
import { TagClient } from '../src/core/utils/tag-client'

vi.stubGlobal('fetch', vi.fn())
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
})

beforeEach(() => (fetch as unknown as vi.Mock).mockReset())

test('getBoardTags uses tag client', async () => {
  ;(fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue([{ id: 't1', title: 'tag' }]),
  })
  const processor = new CardProcessor(undefined, new TagClient('b1', '/api')) as unknown as {
    getBoardTags: () => Promise<Tag[]>
  }
  const tags: Tag[] = await processor.getBoardTags()
  expect((fetch as vi.Mock).mock.calls[0][0]).toBe('/api/b1/tags')
  expect(tags).toHaveLength(1)
})

test('ensureTagIds creates tags via client', async () => {
  const client = {
    getTags: vi.fn(),
    createTag: vi.fn().mockResolvedValue({ id: 't1', title: 'tag' }),
  } as unknown as TagClient
  const processor = new CardProcessor(undefined, client) as unknown as {
    ensureTagIds: (
      names: string[],
      map: Map<string, { id?: string; title: string }>,
    ) => Promise<string[]>
  }
  const map = new Map<string, { id?: string; title: string }>()
  const ids = await processor.ensureTagIds(['tag'], map)
  expect(client.createTag).toHaveBeenCalledWith('tag')
  expect(ids).toEqual(['t1'])
})
