import { describe, it, expect, vi, type Mock } from 'vitest'

import type { BoardBuilder } from '../../src/board/board-builder'
import type { BoardEntity } from '../../src/board/item-types'
import { syncOrUndo, undoWidgets } from '../../src/board/undo-utilities'

interface BuilderMock {
  removeItems: Mock<BoardBuilder['removeItems']>
  syncAll: Mock<BoardBuilder['syncAll']>
  removed: BoardEntity[]
}

function createBuilderMock(overrides?: Partial<Omit<BuilderMock, 'removed'>>): {
  mock: BuilderMock
  builder: BoardBuilder
} {
  const removed: BoardEntity[] = []
  const mock: BuilderMock = {
    removeItems: vi.fn<BoardBuilder['removeItems']>((items) => {
      removed.push(...(items as BoardEntity[]))
      return Promise.resolve()
    }),
    syncAll: vi.fn<BoardBuilder['syncAll']>(() => Promise.resolve()),
    removed,
    ...overrides,
  }
  return { mock, builder: mock as unknown as BoardBuilder }
}

function createEntity(id: string): BoardEntity {
  return { id } as Record<string, unknown> as BoardEntity
}

describe('undo utilities', () => {
  it('undoWidgets removes items and clears registry', async () => {
    const { mock, builder } = createBuilderMock()
    const registry: BoardEntity[] = [createEntity('a'), createEntity('b')]

    await undoWidgets(builder, registry)

    expect(mock.removed.map((item) => item.id)).toEqual(['a', 'b'])
    expect(registry).toHaveLength(0)
  })

  it('syncOrUndo undoes on sync failure', async () => {
    const { mock, builder } = createBuilderMock({
      syncAll: vi.fn<BoardBuilder['syncAll']>(() => Promise.reject(new Error('boom'))),
    })

    const created = createEntity('x')
    const target = createEntity('z')
    const registry: BoardEntity[] = [created]
    await expect(syncOrUndo(builder, registry, [target])).rejects.toThrow('boom')

    expect(registry).toHaveLength(0)
    expect(mock.removeItems).toHaveBeenCalledWith([created])
  })
})
