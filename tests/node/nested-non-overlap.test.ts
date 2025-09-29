import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

function bboxOf(
  ids: string[],
  nodes: Record<string, { x: number; y: number; width: number; height: number }>,
) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const id of ids) {
    const n = nodes[id]!
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  }
  return { minX, minY, maxX, maxY }
}

function disjoint(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
) {
  return a.maxX <= b.minX || b.maxX <= a.minX || a.maxY <= b.minY || b.maxY <= a.minY
}

function inside(
  n: { x: number; y: number; width: number; height: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
) {
  return n.x >= b.minX && n.y >= b.minY && n.x + n.width <= b.maxX && n.y + n.height <= b.maxY
}

describe('Nested Dagre - non-overlap and containment', () => {
  it('keeps sibling subgraphs disjoint and members contained', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'G1', label: 'G1', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'G2', label: 'G2', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'A1', label: 'A1', type: 't', metadata: { parent: 'G1', width: 100, height: 60 } },
        { id: 'A2', label: 'A2', type: 't', metadata: { parent: 'G1', width: 100, height: 60 } },
        { id: 'A3', label: 'A3', type: 't', metadata: { parent: 'G1', width: 100, height: 60 } },
        { id: 'B1', label: 'B1', type: 't', metadata: { parent: 'G2', width: 100, height: 60 } },
        { id: 'B2', label: 'B2', type: 't', metadata: { parent: 'G2', width: 100, height: 60 } },
        { id: 'B3', label: 'B3', type: 't', metadata: { parent: 'G2', width: 100, height: 60 } },
      ],
      edges: [
        { from: 'A1', to: 'A3' },
        { from: 'A2', to: 'A3' },
        { from: 'B1', to: 'B3' },
        { from: 'B2', to: 'B3' },
        // cross-subgraph edges
        { from: 'A1', to: 'B1' },
        { from: 'B2', to: 'A2' },
      ],
    }

    const layout = await layoutGraphDagre(data, {
      direction: 'RIGHT',
      nodeSpacing: 60,
      rankSpacing: 100,
    })
    const g1Ids = ['A1', 'A2', 'A3']
    const g2Ids = ['B1', 'B2', 'B3']
    const bb1 = bboxOf(g1Ids, layout.nodes)
    const bb2 = bboxOf(g2Ids, layout.nodes)
    expect(disjoint(bb1, bb2)).toBe(true)
    for (const id of g1Ids) expect(inside(layout.nodes[id]!, bb1)).toBe(true)
    for (const id of g2Ids) expect(inside(layout.nodes[id]!, bb2)).toBe(true)
  })
})
