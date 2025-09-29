import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

describe('Direction mapping', () => {
  it('graph TB increases y (DOWN)', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'A', label: 'A', type: 't', metadata: { width: 10, height: 10 } },
        { id: 'B', label: 'B', type: 't', metadata: { width: 10, height: 10 } },
      ],
      edges: [{ from: 'A', to: 'B' }],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'DOWN',
      nodeSpacing: 60,
      rankSpacing: 60,
    })
    const A = layout.nodes.A!
    const B = layout.nodes.B!
    expect(B.y + B.height / 2).toBeGreaterThan(A.y + A.height / 2)
  })

  it('graph LR increases x (RIGHT)', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'A', label: 'A', type: 't', metadata: { width: 10, height: 10 } },
        { id: 'B', label: 'B', type: 't', metadata: { width: 10, height: 10 } },
      ],
      edges: [{ from: 'A', to: 'B' }],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'RIGHT',
      nodeSpacing: 60,
      rankSpacing: 60,
    })
    const A = layout.nodes.A!
    const B = layout.nodes.B!
    expect(B.x + B.width / 2).toBeGreaterThan(A.x + A.width / 2)
  })
})
