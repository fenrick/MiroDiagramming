import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { searchBoardContent, replaceBoardContent } from '../../src/board/search-tools'
import { boardCache } from '../../src/board/board-cache'

describe('search-tools', () => {
  let selSpy: ReturnType<typeof vi.spyOn>
  let widSpy: ReturnType<typeof vi.spyOn>
  afterEach(() => {
    selSpy?.mockRestore()
    widSpy?.mockRestore()
    boardCache.reset()
  })

  const mk = (over: Record<string, any> = {}) => ({
    type: 'widget',
    title: 'Hello world',
    content: 'Alpha Beta',
    style: { fillColor: '#abcdef' },
    tagIds: ['t1'],
    createdBy: 'u1',
    lastModifiedBy: 'u2',
    assigneeId: 'u3',
    ...over,
  })

  it('searches selection by text and filters', async () => {
    const items = [mk(), mk({ content: 'Gamma', style: { fillColor: '#000000' } })]
    selSpy = vi.spyOn(boardCache, 'getSelection').mockResolvedValue(items as any)
    const results = await searchBoardContent(
      {
        query: 'alpha',
        caseSensitive: false,
        wholeWord: false,
        inSelection: true,
        widgetTypes: ['widget'],
        tagIds: ['t1'],
        backgroundColor: '#abcdef',
        creator: 'u1',
        lastModifiedBy: 'u2',
        assignee: 'u3',
      },
      {
        // BoardQueryLike stub not used due to selection
      } as any,
    )
    expect(results.length).toBe(1)
    expect(results[0]!.field).toBe('content')
  })

  it('supports regex + whole word and getWidgets when not inSelection', async () => {
    const items = [mk({ content: 'foo bar baz' }), mk({ content: 'foobarbaz' })]
    widSpy = vi.spyOn(boardCache, 'getWidgets').mockResolvedValue(items as any)
    const results = await searchBoardContent(
      {
        query: 'bar',
        regex: false,
        wholeWord: true,
        widgetTypes: ['widget'],
      },
      {
        get: vi.fn(),
      } as any,
    )
    expect(results.length).toBe(1)
    expect(results[0]!.field).toBe('content')
  })

  it('replaces content and counts replacements', async () => {
    const i1 = mk({ content: 'one two two' })
    const i2 = mk({ content: 'nothing' })
    selSpy = vi.spyOn(boardCache, 'getSelection').mockResolvedValue([i1, i2] as any)
    const count = await replaceBoardContent(
      {
        query: 'two',
        replacement: '2',
        inSelection: true,
      },
      {
        get: vi.fn(),
      } as any,
    )
    expect(count).toBe(2)
    expect(i1.content).toBe('one 2 2')
    expect(i2.content).toBe('nothing')
  })
})
