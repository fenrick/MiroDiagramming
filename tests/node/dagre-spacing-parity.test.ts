import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

/**
 * Verify Dagre spacing parity with Mermaid semantics.
 * For LR: nodes in the same rank should be vertically separated by nodeSpacing,
 * and x separation between ranks should be ~ rankSpacing.
 */
describe('Dagre spacing parity (LR)', () => {
  it('respects nodeSpacing=80 and rankSpacing=120', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'A', label: 'A', type: 't', metadata: { width: 10, height: 10 } },
        { id: 'B', label: 'B', type: 't', metadata: { width: 10, height: 10 } },
        { id: 'C', label: 'C', type: 't', metadata: { width: 10, height: 10 } },
      ],
      // A and B feed C → A,B share same rank; C on next rank
      edges: [
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ],
    }

    const nodeSpacing = 80
    const rankSpacing = 120
    const layout = await layoutGraphDagre(data, {
      direction: 'RIGHT',
      nodeSpacing,
      rankSpacing,
    })

    const A = layout.nodes.A!
    const B = layout.nodes.B!
    const C = layout.nodes.C!

    // Centres
    const Ac = { x: A.x + A.width / 2, y: A.y + A.height / 2 }
    const Bc = { x: B.x + B.width / 2, y: B.y + B.height / 2 }
    const Cc = { x: C.x + C.width / 2, y: C.y + C.height / 2 }

    const tol = 20 // dagre rounding/compaction can shift by ~10–20px

    // Same rank (A,B): dominant axis delta ≈ nodeSpacing
    const sameDx = Math.abs(Bc.x - Ac.x)
    const sameDy = Math.abs(Bc.y - Ac.y)
    const sameDominant = Math.max(sameDx, sameDy)
    expect(sameDominant).toBeGreaterThanOrEqual(nodeSpacing - tol)
    expect(sameDominant).toBeLessThanOrEqual(nodeSpacing + tol)

    // Different ranks (A → C): dominant axis delta ≈ rankSpacing
    const rankDx = Math.abs(Cc.x - Ac.x)
    const rankDy = Math.abs(Cc.y - Ac.y)
    const rankDominant = Math.max(rankDx, rankDy)
    expect(rankDominant).toBeGreaterThanOrEqual(rankSpacing - tol)
    expect(rankDominant).toBeLessThanOrEqual(rankSpacing + tol)
  })
})
