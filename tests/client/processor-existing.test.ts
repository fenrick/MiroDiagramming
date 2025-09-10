import { BoardBuilder } from '../src/board/board-builder'
import { GraphProcessor } from '../src/core/graph/graph-processor'
import { layoutEngine } from '../src/core/layout/elk-layout'

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> }
}

declare const global: GlobalWithMiro

describe('GraphProcessor with existing nodes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete global.miro
  })

  test('ignore mode keeps existing position', async () => {
    const processor = new GraphProcessor()
    const shape = {
      id: 's',
      type: 'shape',
      x: 5,
      y: 6,
      sync: vi.fn(),
      setMetadata: vi.fn(),
      getMetadata: vi.fn(),
    } as Record<string, unknown>
    global.miro = {
      board: {
        getSelection: vi.fn().mockResolvedValue([shape]),
        get: vi.fn().mockResolvedValue([]),
        findEmptySpace: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          zoomTo: vi.fn(),
          set: vi.fn(),
        },
        createConnector: vi.fn().mockResolvedValue({
          setMetadata: vi.fn(),
          getMetadata: vi.fn(),
          sync: vi.fn(),
          id: 'c',
        }),
        createShape: vi.fn(),
        createText: vi.fn(),
        createFrame: vi.fn().mockResolvedValue({ id: 'f' }),
        group: vi.fn().mockResolvedValue({
          type: 'group',
          getItems: vi.fn().mockResolvedValue([]),
        }),
      },
    }
    vi.spyOn(BoardBuilder.prototype, 'findNodeInSelection').mockResolvedValue(shape as unknown)
    vi.spyOn(BoardBuilder.prototype, 'createNode').mockResolvedValue(shape as unknown)
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
      nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
      edges: [],
    })
    const graph = { nodes: [{ id: 'n1', label: 'L', type: 'T' }], edges: [] }
    await processor.processGraph(graph as unknown, {
      existingMode: 'ignore',
      createFrame: false,
    })
    expect((shape as { x: number }).x).toBe(5)
    expect(BoardBuilder.prototype.createNode).not.toHaveBeenCalled()
  })

  test('layout mode forwards coordinates to layout engine', async () => {
    const processor = new GraphProcessor()
    const shape = {
      id: 's',
      type: 'shape',
      x: 10,
      y: 20,
      sync: vi.fn(),
      setMetadata: vi.fn(),
      getMetadata: vi.fn(),
    } as Record<string, unknown>
    global.miro = {
      board: {
        getSelection: vi.fn().mockResolvedValue([shape]),
        get: vi.fn().mockResolvedValue([]),
        findEmptySpace: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          zoomTo: vi.fn(),
          set: vi.fn(),
        },
        createConnector: vi.fn().mockResolvedValue({
          setMetadata: vi.fn(),
          getMetadata: vi.fn(),
          sync: vi.fn(),
          id: 'c',
        }),
        createShape: vi.fn(),
        createText: vi.fn(),
        createFrame: vi.fn().mockResolvedValue({ id: 'f' }),
        group: vi.fn().mockResolvedValue({
          type: 'group',
          getItems: vi.fn().mockResolvedValue([]),
        }),
      },
    }
    vi.spyOn(BoardBuilder.prototype, 'findNodeInSelection').mockResolvedValue(shape as unknown)
    const spy = vi.spyOn(layoutEngine, 'layoutGraph').mockImplementation(async (g) => {
      expect((g as { nodes: unknown[] }).nodes[0]).toHaveProperty('metadata')
      return {
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      }
    })
    const graph = { nodes: [{ id: 'n1', label: 'L', type: 'T' }], edges: [] }
    await processor.processGraph(graph as unknown, {
      existingMode: 'layout',
      createFrame: false,
    })
    expect(spy).toHaveBeenCalled()
  })
})
