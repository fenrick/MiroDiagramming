import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/board/node-search', () => ({
  searchShapes: vi.fn(),
  searchGroups: vi.fn(),
}))
vi.mock('../../src/board/connector-utils', () => ({
  createConnector: vi.fn(),
  updateConnector: vi.fn(),
}))
vi.mock('../../src/board/templates', () => ({
  templateManager: {
    getTemplate: vi.fn().mockReturnValue({ elements: [{ shape: 'rectangle', width: 10, height: 10 }] }),
    createFromTemplate: vi.fn().mockResolvedValue({ id: 'new-shape', width: 0, height: 0 }),
    getConnectorTemplate: vi.fn().mockReturnValue({ style: { strokeColor: '#000' } }),
  },
}))

import { searchGroups, searchShapes } from '../../src/board/node-search'
import { createConnector } from '../../src/board/connector-utils'
import { BoardBuilder } from '../../src/board/board-builder'
import { boardCache } from '../../src/board/board-cache'

describe('BoardBuilder', () => {
  beforeAll(() => {
    ;(globalThis as any).miro = { board: { ui: {}, viewport: {}, group: vi.fn() } }
  })
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    boardCache.reset()
  })

  it('findNode validates params and falls back from shapes to groups', async () => {
    const builder = new BoardBuilder()
    await expect(builder.findNode(123 as any, 'X' as any, { get: vi.fn() } as any)).rejects.toThrow()
    ;(searchShapes as unknown as jest.Mock).mockResolvedValue(undefined)
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([] as any)
    const group = { id: 'g' }
    ;(searchGroups as unknown as jest.Mock).mockResolvedValue(group)
    const res = await builder.findNode('type', 'label', { get: vi.fn() } as any)
    expect(res).toBe(group)
  })

  it('findNodeInSelection searches only selection', async () => {
    const builder = new BoardBuilder()
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue([{ id: 's', type: 'shape', content: 'L' }] as any)
    ;(searchShapes as unknown as jest.Mock).mockResolvedValue({ id: 's' })
    const found = await builder.findNodeInSelection('type', 'L')
    expect(found).toEqual({ id: 's' })
  })

  it('createEdges creates connectors and logs failures', async () => {
    const builder = new BoardBuilder()
    ;(createConnector as unknown as jest.Mock)
      .mockResolvedValueOnce({ id: 'c1' })
      .mockRejectedValueOnce(new Error('bad'))
    const edges = [
      { id: 'e1', from: 'a', to: 'b', metadata: { template: 'flow' } },
      { id: 'e2', from: 'a', to: 'b' },
    ] as any
    const nodeMap = { a: { id: 'A' }, b: { id: 'B' } } as any
    const conns = await builder.createEdges(edges, nodeMap)
    expect(conns.length).toBe(1)
    expect(conns[0]!.id).toBe('c1')
  })

  it('resizeItem sets width and height', async () => {
    const builder = new BoardBuilder()
    const item: any = { width: 1, height: 2 }
    await builder.resizeItem(item, 10, 20)
    expect(item.width).toBe(10)
    expect(item.height).toBe(20)
  })
})
