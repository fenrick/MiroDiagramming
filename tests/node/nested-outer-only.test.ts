import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

function bboxOf(n: { x: number; y: number; width: number; height: number }) {
  return { minX: n.x, minY: n.y, maxX: n.x + n.width, maxY: n.y + n.height }
}

function inside(
  n: { x: number; y: number; width: number; height: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
) {
  return n.x >= b.minX && n.y >= b.minY && n.x + n.width <= b.maxX && n.y + n.height <= b.maxY
}

describe('Nested Dagre - outer cluster with only inner clusters', () => {
  it('creates proxies for both Inner and Outer and ensures containment', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'Outer', label: 'Outer', type: 'Composite', metadata: { isSubgraph: true } },
        {
          id: 'Inner',
          label: 'Inner',
          type: 'Composite',
          metadata: { isSubgraph: true, parent: 'Outer' },
        },
        { id: 'A', label: 'A', type: 't', metadata: { parent: 'Inner', width: 80, height: 48 } },
        { id: 'B', label: 'B', type: 't', metadata: { parent: 'Inner', width: 80, height: 48 } },
      ],
      edges: [{ from: 'A', to: 'B' }],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'RIGHT',
      nodeSpacing: 60,
      rankSpacing: 100,
    })
    // Expect proxy entries present for both clusters
    expect(layout.nodes.Outer).toBeTruthy()
    expect(layout.nodes.Inner).toBeTruthy()
    const bboxOuter = bboxOf(layout.nodes.Outer!)
    const bboxInner = bboxOf(layout.nodes.Inner!)
    // Inner must be inside Outer
    expect(inside(layout.nodes.Inner!, bboxOuter)).toBe(true)
    // A and B inside Inner
    expect(inside(layout.nodes.A!, bboxInner)).toBe(true)
    expect(inside(layout.nodes.B!, bboxInner)).toBe(true)
  })
})
