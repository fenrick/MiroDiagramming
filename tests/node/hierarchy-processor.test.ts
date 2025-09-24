import { describe, it, expect, vi } from 'vitest'

import { HierarchyProcessor } from '../../src/core/graph/hierarchy-processor'
import * as nested from '../../src/core/layout/nested-layout'

describe('HierarchyProcessor', () => {
  it('creates nested widgets and optional frame, then zooms', async () => {
    const builder = {
      findSpace: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
      createNode: vi.fn(async (node: any) => ({ id: `w-${node.id}`, type: 'shape' })),
      resizeItem: vi.fn().mockResolvedValue(undefined),
      groupItems: vi.fn(async (items: any[]) => ({ id: 'g', items })),
      zoomTo: vi.fn().mockResolvedValue(undefined),
      syncAll: vi.fn().mockResolvedValue(undefined),
      setFrame: vi.fn(),
      createFrame: vi.fn(async (w: number, h: number, x: number, y: number, title?: string) => ({
        id: 'frame',
        w,
        h,
        x,
        y,
        title,
      })),
    } as any

    // Mock layoutHierarchy to produce two nested nodes
    vi.spyOn(nested, 'layoutHierarchy').mockResolvedValue({
      nodes: {
        a: { x: 0, y: 0, width: 10, height: 10 },
        b: { x: 10, y: 10, width: 10, height: 10 },
      },
    } as any)

    const hp = new HierarchyProcessor(builder)
    await hp.processHierarchy(
      [{ id: 'a', type: 't', label: 'A', children: [{ id: 'b', type: 't', label: 'B' }] }] as any,
      { createFrame: true, frameTitle: 'Nested' },
    )
    // Parent + child grouped into one
    expect(builder.groupItems).toHaveBeenCalled()
    expect(builder.zoomTo).toHaveBeenCalled()
    expect(hp.getLastCreated().length).toBeGreaterThan(0)
  })
})
