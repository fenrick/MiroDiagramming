import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { GraphProcessor } from '../../src/core/graph/graph-processor'

// Spy on maybeSync used by GraphProcessor when moving existing widgets
vi.mock('../../src/board/board', async (orig) => {
  const mod: any = await (orig as any)()
  return {
    ...mod,
    maybeSync: vi.fn().mockResolvedValue(undefined),
  }
})

// Mock registerFrame to return a dummy frame
vi.mock('../../src/board/frame-utilities', async (orig) => {
  const mod: any = await (orig as any)()
  return {
    ...mod,
    registerFrame: vi.fn(async (_b: any, _r: any, w: number, h: number, x: number, y: number) => ({
      id: 'frame-x',
      width: w,
      height: h,
      x,
      y,
    })),
  }
})

describe('GraphProcessor existingMode + frame', () => {
  const baseData = {
    nodes: [
      { id: 'a', type: 't', label: 'A' },
      { id: 'b', type: 't', label: 'B' },
    ],
    edges: [],
  }
  const baseLayout = {
    nodes: {
      a: { id: 'a', x: 0, y: 0, width: 10, height: 10 },
      b: { id: 'b', x: 10, y: 10, width: 10, height: 10 },
    },
    edges: [],
  }

  let layoutSpy: ReturnType<typeof vi.spyOn>
  beforeEach(async () => {
    const { layoutEngine } = await import('../../src/core/layout/elk-layout')
    layoutSpy = vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue(baseLayout as any)
  })
  afterEach(() => {
    layoutSpy.mockRestore()
  })

  it('existingMode=ignore uses existing coords without syncing', async () => {
    const existingA = { id: 'w-a', x: 5, y: 6, width: 10, height: 10 }
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any) => ({ id: `w-${_n.id}` })),
      createEdges: vi.fn(async () => []),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      findNodeInSelection: vi.fn(async (_t: string, l: string) =>
        l === 'A' ? existingA : undefined,
      ),
      setFrame: vi.fn(),
    } as any
    const gp = new GraphProcessor(builder)
    await gp.processGraph(baseData, {
      createFrame: false,
      layout: { algorithm: 'mrtree' },
      existingMode: 'ignore',
    })
    // Only node B created
    expect(builder.createNode).toHaveBeenCalledTimes(1)
    // No syncAll was called before edges
    expect(builder.syncAll).toHaveBeenCalled()
  })

  it('existingMode=move adjusts position and syncs existing', async () => {
    const existingA: any = { id: 'w-a', x: 0, y: 0, width: 10, height: 10, sync: vi.fn() }
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any) => ({ id: `w-${_n.id}` })),
      createEdges: vi.fn(async () => []),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      findNodeInSelection: vi.fn(async (_t: string, l: string) =>
        l === 'A' ? existingA : undefined,
      ),
      setFrame: vi.fn(),
    } as any
    const gp = new GraphProcessor(builder)
    await gp.processGraph(baseData, {
      createFrame: false,
      layout: { algorithm: 'mrtree' },
      existingMode: 'move',
    })
    expect(existingA.x).not.toBe(0)
    expect(existingA.y).not.toBe(0)
  })

  it('creates frame and zooms to it when createFrame is true', async () => {
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (_n: any) => ({ id: `w-${_n.id}` })),
      createEdges: vi.fn(async () => []),
      zoomTo: vi.fn(),
      syncAll: vi.fn(),
      findNodeInSelection: vi.fn(async () => undefined),
      setFrame: vi.fn(),
    } as any
    const gp = new GraphProcessor(builder)
    await gp.processGraph(baseData, { createFrame: true, layout: { algorithm: 'mrtree' } })
    expect(builder.zoomTo).toHaveBeenCalledWith(expect.objectContaining({ id: 'frame-x' }))
  })
})
