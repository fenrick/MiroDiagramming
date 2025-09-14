import { beforeEach, expect, test, vi } from 'vitest'

import { TagClient } from '../src/core/utils/tag-client'

vi.stubGlobal('fetch', vi.fn())
vi.stubGlobal('miro', {
  board: {
    getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }),
    createTag: vi.fn(),
  },
})

beforeEach(() => {
  ;(fetch as unknown as vi.Mock).mockReset()
  ;(miro.board.createTag as vi.Mock).mockReset()
})

test('getTags fetches board tags', async () => {
  ;(fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue([{ id: 't1', title: 'Tag' }]),
  })
  const api = new TagClient('b1', '/api')
  const tags = await api.getTags()
  expect((fetch as vi.Mock).mock.calls[0][0]).toBe('/api/b1/tags')
  expect(tags).toEqual([{ id: 't1', title: 'Tag' }])
})

test('createTag creates tag via SDK', async () => {
  ;(miro.board.createTag as vi.Mock).mockResolvedValueOnce({ id: 't2', title: 'New' })
  const api = new TagClient('b1', '/api')
  const tag = await api.createTag('New')
  expect((miro.board.createTag as vi.Mock).mock.calls[0][0]).toEqual({ title: 'New' })
  expect(tag).toEqual({ id: 't2', title: 'New' })
})
