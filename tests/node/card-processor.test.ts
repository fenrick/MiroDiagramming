import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import type { Card } from '@mirohq/websdk-types'

import { CardProcessor } from '../../src/board/card-processor'
import { boardCache } from '../../src/board/board-cache'
import { BoardBuilder } from '../../src/board/board-builder'
import type { TagClient } from '../../src/core/utils/tag-client'

const createMiroStub = (
  getImpl: () => Promise<unknown[]>,
): { board: { get: ReturnType<typeof vi.fn>; createCard: ReturnType<typeof vi.fn> } } => {
  const board = {
    get: vi.fn(getImpl),
    createCard: vi.fn(),
    createFrame: vi.fn().mockResolvedValue({ id: 'frame', add: vi.fn() }),
    findEmptySpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
    viewport: {
      zoomTo: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
    },
    remove: vi.fn().mockResolvedValue(undefined),
    group: vi.fn().mockResolvedValue({}),
  }
  ;(globalThis as unknown as { miro?: unknown }).miro = { board }
  return { board }
}

describe('CardProcessor', () => {
  beforeEach(() => {
    boardCache.reset()
  })

  afterEach(() => {
    delete (globalThis as { miro?: unknown }).miro
    vi.restoreAllMocks()
  })

  it('reuses cached board results when processing multiple runs', async () => {
    const existing = { id: 'card-1', type: 'card', description: 'ID:alpha' } as unknown as Card
    const { board } = createMiroStub(() => Promise.resolve([existing]))
    const tagClient = {
      getTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn(),
    } as unknown as TagClient
    const processor = new CardProcessor(new BoardBuilder(), tagClient)

    await processor.processCards([], {})
    expect(board.get).toHaveBeenCalledTimes(1)

    await processor.processCards([], {})
    expect(board.get).toHaveBeenCalledTimes(1)
  })

  it('updates existing cards when identifiers match', async () => {
    const existing = {
      id: 'card-1',
      type: 'card',
      title: 'Old title',
      description: 'Legacy\nID:abc123',
      tagIds: [],
    } as unknown as Card
    const { board } = createMiroStub(() => Promise.resolve([existing]))
    const tagClient = {
      getTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn().mockResolvedValue({ id: 'tag-1', title: 'foo' }),
    } as unknown as TagClient
    const processor = new CardProcessor(new BoardBuilder(), tagClient)

    await processor.processCards(
      [
        {
          id: 'abc123',
          title: 'New title',
          description: 'Updated description',
          tags: ['foo'],
        },
      ],
      {},
    )

    expect(board.get).toHaveBeenCalledTimes(1)
    expect(board.createCard).not.toHaveBeenCalled()
    expect(existing.title).toBe('New title')
    expect(existing.description).toBe('Updated description\nID:abc123')
  })
  it('normalises identifier lookups with optional whitespace', async () => {
    const existing = {
      id: 'card-1',
      type: 'card',
      title: 'Old title',
      description: 'Legacy\nID: abc123',
      tagIds: [],
    } as unknown as Card
    createMiroStub(() => Promise.resolve([existing]))
    const tagClient = {
      getTags: vi.fn().mockResolvedValue([]),
      createTag: vi.fn(),
    } as unknown as TagClient
    const processor = new CardProcessor(new BoardBuilder(), tagClient)

    await processor.processCards(
      [
        {
          id: 'abc123',
          title: 'Whitespace safe',
          description: 'Updated description',
        },
      ],
      {},
    )

    expect(existing.title).toBe('Whitespace safe')
    expect(existing.description).toBe('Updated description\nID:abc123')
  })
})
