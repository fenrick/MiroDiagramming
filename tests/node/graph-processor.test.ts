import { describe, it, expect, vi, afterEach } from 'vitest'

import { GraphProcessor } from '../../src/core/graph/graph-processor'
import { layoutEngine } from '../../src/core/layout/elk-layout'

describe('GraphProcessor', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('processGraph creates nodes, edges and zooms', async () => {
    const gpBuilder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any, _p: any) => ({ id: `w-${_n.id}` })),
      createEdges: vi.fn(async () => [{ id: 'c1' }]),
      zoomTo: vi.fn().mockResolvedValue(undefined),
      syncAll: vi.fn().mockResolvedValue(undefined),
      findNodeInSelection: vi.fn().mockResolvedValue(undefined),
      setFrame: vi.fn(),
    } as any

    // Mock layout engine result
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
      nodes: {
        a: { id: 'a', x: 10, y: 20, width: 30, height: 40 },
        b: { id: 'b', x: 50, y: 60, width: 70, height: 80 },
      },
      edges: [
        {
          id: 'e1',
          from: 'a',
          to: 'b',
          startPoint: { x: 10, y: 20 },
          endPoint: { x: 50, y: 60 },
        } as any,
      ],
    } as any)

    const gp = new GraphProcessor(gpBuilder)
    const data = {
      nodes: [
        { id: 'a', type: 't', label: 'A' },
        { id: 'b', type: 't', label: 'B' },
      ],
      edges: [{ id: 'e1', from: 'a', to: 'b' }],
    }
    await gp.processGraph(data, { createFrame: false, layout: { algorithm: 'mrtree' } })
    expect(gpBuilder.createNode).toHaveBeenCalledTimes(2)
    expect(gpBuilder.createEdges).toHaveBeenCalledTimes(1)
    // Zoom called with node list when no frame
    expect(gpBuilder.zoomTo).toHaveBeenCalled()
    const idMap = gp.getNodeIdMap()
    expect(Object.keys(idMap)).toEqual(['a', 'b'])
  })

  it('throws on invalid graphs (missing node on edge)', async () => {
    const gp = new GraphProcessor({
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(),
      createEdges: vi.fn(),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      findNodeInSelection: vi.fn(),
    } as any)
    const bad = {
      nodes: [{ id: 'a', type: 't', label: 'A' }],
      edges: [{ id: 'e', from: 'a', to: 'x' }],
    }
    await expect(
      gp.processGraph(bad, { createFrame: false, layout: { algorithm: 'mrtree' } }),
    ).rejects.toThrow(/missing node/i)
  })

  it('uses existing widgets in layout mode instead of creating', async () => {
    const existingA = { id: 'w-a', x: 5, y: 5, width: 10, height: 10 }
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any) => ({ id: `w-${_n.id}` })),
      createEdges: vi.fn(async () => []),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      findNodeInSelection: vi.fn(async (t: string, l: string) =>
        l === 'A' ? existingA : undefined,
      ),
      setFrame: vi.fn(),
    } as any
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
      nodes: {
        a: { id: 'a', x: 0, y: 0, width: 10, height: 10 },
        b: { id: 'b', x: 10, y: 10, width: 10, height: 10 },
      },
      edges: [],
    } as any)
    const gp = new GraphProcessor(builder)
    const data = {
      nodes: [
        { id: 'a', type: 't', label: 'A' },
        { id: 'b', type: 't', label: 'B' },
      ],
      edges: [],
    }
    await gp.processGraph(data, {
      createFrame: false,
      layout: { algorithm: 'mrtree' },
      existingMode: 'layout',
    })
    // Only missing node B is created
    expect(builder.createNode).toHaveBeenCalledTimes(1)
  })

  it('applies Mermaid metadata overrides to created shapes', async () => {
    const applyTemplate = vi.fn()
    const commit = vi.fn().mockResolvedValue(undefined)
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any) => ({
        id: `w-${_n.id}`,
        type: 'shape',
        shape: 'rectangle',
      })),
      createEdges: vi.fn(async () => []),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      beginShapeInteraction: vi.fn(() => ({ applyTemplate, commit })),
      findNodeInSelection: vi.fn(async () => undefined),
      setFrame: vi.fn(),
    } as any
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
      nodes: { a: { id: 'a', x: 0, y: 0, width: 40, height: 20 } },
      edges: [],
    } as any)

    const gp = new GraphProcessor(builder)
    await gp.processGraph(
      {
        nodes: [
          {
            id: 'a',
            type: 'MermaidNode',
            label: 'Styled',
            metadata: {
              styleOverrides: {
                fillColor: '#f00',
                borderColor: '#0f0',
                borderWidth: 2,
                textColor: '#00f',
              },
              shape: 'hexagon',
            },
          },
        ],
        edges: [],
      },
      { createFrame: false, layout: { algorithm: 'mrtree' } },
    )

    expect(builder.beginShapeInteraction).toHaveBeenCalled()
    expect(applyTemplate).toHaveBeenCalledWith(
      {
        style: {
          fillColor: '#f00',
          borderColor: '#0f0',
          borderWidth: 2,
          color: '#00f',
        },
        shape: 'hexagon',
      },
      'Styled',
    )
    expect(commit).toHaveBeenCalled()
  })
})
