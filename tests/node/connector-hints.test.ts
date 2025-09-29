import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'
import { computeEdgeHints } from '../../src/core/layout/layout-utilities'

describe('Connector hints (fractional attachments)', () => {
  it('positions start near right boundary and end near left for LR', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'A', label: 'A', type: 't', metadata: { width: 60, height: 30 } },
        { id: 'B', label: 'B', type: 't', metadata: { width: 60, height: 30 } },
      ],
      edges: [{ from: 'A', to: 'B' }],
    }
    const layout = await layoutGraphDagre(data, {
      direction: 'RIGHT',
      nodeSpacing: 60,
      rankSpacing: 120,
    })
    const hints = computeEdgeHints(data, layout)
    const h = hints[0]!
    expect(h.startPosition?.x ?? 0).toBeGreaterThan(0.85)
    expect(h.endPosition?.x ?? 1).toBeLessThan(0.15)
  })
})
