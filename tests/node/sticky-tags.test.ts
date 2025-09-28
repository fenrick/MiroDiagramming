import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/ui/components/toast', () => ({ pushToast: vi.fn() }))
vi.mock('../../src/core/utils/tag-client', () => {
  class TagClientMock {
    async getTags() {
      return [{ id: 't1', title: 'A' }]
    }
    async createTag(name: string) {
      return { id: `new-${name}`, title: name }
    }
  }
  return { TagClient: TagClientMock }
})
vi.mock('../../src/board/board', () => ({
  ensureBoard: () => ({ id: 'board-1' }),
  maybeSync: async () => {},
}))

import { boardCache } from '../../src/board/board-cache'
import { pushToast } from '../../src/ui/components/toast'
import { applyBracketTagsToSelectedStickies } from '../../src/board/sticky-tags'

describe('sticky-tags', () => {
  let spySel: ReturnType<typeof vi.spyOn>
  afterEach(() => {
    spySel?.mockRestore()
    boardCache.reset()
    vi.clearAllMocks()
  })

  it('shows toast when no stickies are selected', async () => {
    spySel = vi.spyOn(boardCache, 'getSelection').mockResolvedValue([] as any)
    await applyBracketTagsToSelectedStickies()
    expect(pushToast).toHaveBeenCalledWith({ message: 'Select sticky notes to tag.' })
  })

  it('applies tags and strips bracketed text', async () => {
    const sticky = { type: 'sticky_note', content: 'Hello [A] [B]' } as any
    spySel = vi.spyOn(boardCache, 'getSelection').mockResolvedValue([sticky])
    await applyBracketTagsToSelectedStickies()
    // Tag ids should include existing + newly created
    expect(Array.isArray(sticky.tagIds)).toBe(true)
    // Content stripped of brackets (writeItemText changes content)
    expect(String(sticky.content)).toContain('Hello')
    expect(String(sticky.content)).not.toContain('[A]')
    expect(pushToast).toHaveBeenCalled()
  })
})
