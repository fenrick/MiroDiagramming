import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

function center(n: { x: number; y: number; width: number; height: number }) {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 }
}

describe('Nested Dagre - direction behavior', () => {
  it('honors local subgraph direction when no external links', async () => {
    const data: GraphData = {
      nodes: [
        {
          id: 'G1',
          label: 'G1',
          type: 'Composite',
          metadata: { isSubgraph: true, subgraphDirection: 'DOWN' },
        },
        { id: 'G2', label: 'G2', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'A1', label: 'A1', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'A2', label: 'A2', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'B1', label: 'B1', type: 't', metadata: { parent: 'G2', width: 90, height: 50 } },
      ],
      edges: [
        { from: 'A1', to: 'A2' }, // inner link only
        // no cross-subgraph links
      ],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'LEFT',
      nodeSpacing: 60,
      rankSpacing: 100,
    })
    const a1 = center(layout.nodes.A1!)
    const a2 = center(layout.nodes.A2!)
    expect(a2.y).toBeGreaterThan(a1.y) // TB (DOWN) within subgraph
  })

  it('inherits parent direction when external links exist', async () => {
    const data: GraphData = {
      nodes: [
        {
          id: 'G1',
          label: 'G1',
          type: 'Composite',
          metadata: { isSubgraph: true, subgraphDirection: 'DOWN' },
        },
        { id: 'G2', label: 'G2', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'A1', label: 'A1', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'A2', label: 'A2', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'B1', label: 'B1', type: 't', metadata: { parent: 'G2', width: 90, height: 50 } },
      ],
      edges: [
        { from: 'A1', to: 'A2' },
        { from: 'A2', to: 'B1' }, // external link triggers inheritance
      ],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'LEFT',
      nodeSpacing: 60,
      rankSpacing: 100,
    })
    const a1 = center(layout.nodes.A1!)
    const a2 = center(layout.nodes.A2!)
    // Inherit parent LEFT (RL rankdir) → horizontal ordering; expect |dx| >= |dy|
    expect(Math.abs(a2.x - a1.x)).toBeGreaterThanOrEqual(Math.abs(a2.y - a1.y))
  })
})
