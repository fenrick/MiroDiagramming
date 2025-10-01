import type { BaseItem, Frame, Group } from '@mirohq/websdk-types'
import type { MockedFunction } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BoardBuilder } from '../../src/board/board-builder'
import { HierarchyProcessor } from '../../src/core/graph/hierarchy-processor'
import * as nested from '../../src/core/layout/nested-layout'
import * as frameUtilities from '../../src/board/frame-utilities'

const layoutHierarchySpy = vi.spyOn(nested, 'layoutHierarchy')
const clearActiveFrameSpy = vi.spyOn(frameUtilities, 'clearActiveFrame')
const registerFrameSpy = vi.spyOn(frameUtilities, 'registerFrame')

const createNodeImpl: BoardBuilder['createNode'] = (node) => {
  if (!node || typeof node !== 'object') {
    throw new TypeError('Invalid node in test harness')
  }
  const { id, type } = node as { id?: unknown; type?: unknown }
  if (typeof id !== 'string' || typeof type !== 'string') {
    throw new TypeError('Invalid node in test harness')
  }
  return Promise.resolve({ id: `w-${id}`, type } as BaseItem)
}

const groupItemsImpl: BoardBuilder['groupItems'] = (items) =>
  Promise.resolve({ id: 'g', items } as unknown as Group)

const createFrameImpl: BoardBuilder['createFrame'] = (width, height, x, y, title) =>
  Promise.resolve({
    id: 'frame',
    type: 'frame',
    width,
    height,
    x,
    y,
    title: title ?? '',
    rotation: 0,
    style: {} as Frame['style'],
    metadata: {},
    childIds: [],
    parentId: null,
  } as unknown as Frame)

function createBuilder(): {
  builder: BoardBuilder
  groupItemsMock: MockedFunction<BoardBuilder['groupItems']>
  zoomToMock: MockedFunction<BoardBuilder['zoomTo']>
} {
  const builder = new BoardBuilder()

  builder.createNode = vi.fn(createNodeImpl) as typeof builder.createNode

  const groupItemsMock = vi.fn(groupItemsImpl) as MockedFunction<BoardBuilder['groupItems']>
  builder.groupItems = groupItemsMock as typeof builder.groupItems

  builder.createFrame = vi.fn(createFrameImpl) as typeof builder.createFrame

  builder.findSpace = vi.fn(() => Promise.resolve({ x: 0, y: 0 })) as typeof builder.findSpace
  builder.resizeItem = vi.fn() as typeof builder.resizeItem
  const zoomToMock = vi.fn(() => Promise.resolve()) as MockedFunction<BoardBuilder['zoomTo']>
  builder.zoomTo = zoomToMock as typeof builder.zoomTo
  builder.syncAll = vi.fn(() => Promise.resolve()) as typeof builder.syncAll
  builder.setFrame = vi.fn() as typeof builder.setFrame

  return { builder, groupItemsMock, zoomToMock }
}

beforeEach(() => {
  layoutHierarchySpy.mockReset()
  clearActiveFrameSpy.mockClear()
  registerFrameSpy.mockClear()
})

describe('HierarchyProcessor', () => {
  it('creates nested widgets and optional frame, then zooms', async () => {
    const { builder, groupItemsMock, zoomToMock } = createBuilder()
    layoutHierarchySpy.mockResolvedValue({
      nodes: {
        a: { id: 'a', x: 0, y: 0, width: 10, height: 10 },
        b: { id: 'b', x: 10, y: 10, width: 10, height: 10 },
      },
    } as unknown as nested.NestedLayoutResult)

    const processor = new HierarchyProcessor(builder)
    await processor.processHierarchy(
      [{ id: 'a', type: 't', label: 'A', children: [{ id: 'b', type: 't', label: 'B' }] }],
      { createFrame: true, frameTitle: 'Nested' },
    )

    expect(groupItemsMock).toHaveBeenCalled()
    expect(registerFrameSpy).toHaveBeenCalledWith(
      builder,
      expect.any(Array),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
      'Nested',
    )
    expect(zoomToMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'frame' }))
    expect(processor.getLastCreated().length).toBeGreaterThan(0)
  })

  it('skips frame creation and clears active frame when disabled', async () => {
    const { builder, zoomToMock } = createBuilder()
    layoutHierarchySpy.mockResolvedValue({
      nodes: {
        a: { id: 'a', x: 0, y: 0, width: 10, height: 10 },
      },
    } as unknown as nested.NestedLayoutResult)

    const processor = new HierarchyProcessor(builder)
    await processor.processHierarchy([{ id: 'a', type: 't', label: 'A' }], { createFrame: false })

    expect(clearActiveFrameSpy).toHaveBeenCalledWith(builder)
    expect(registerFrameSpy).not.toHaveBeenCalled()
    expect(zoomToMock).toHaveBeenCalledWith([expect.objectContaining({ id: 'w-a' })])
  })
})
