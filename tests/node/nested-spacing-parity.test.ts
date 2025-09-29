import { describe, it, expect } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

const tol = 20
const dominant = (dx: number, dy: number) => Math.max(Math.abs(dx), Math.abs(dy))

function center(n: { x: number; y: number; width: number; height: number }) {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 }
}

function bboxCenter(
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
  return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 }
}

describe('Nested Dagre - spacing parity inner and outer', () => {
  it('matches ~nodeSpacing within subgraphs and ~rankSpacing across ranks', async () => {
    const nodeSpacing = 80
    const rankSpacing = 120
    const data: GraphData = {
      nodes: [
        { id: 'G1', label: 'G1', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'G2', label: 'G2', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'A1', label: 'A1', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'A2', label: 'A2', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'A3', label: 'A3', type: 't', metadata: { parent: 'G1', width: 90, height: 50 } },
        { id: 'B1', label: 'B1', type: 't', metadata: { parent: 'G2', width: 90, height: 50 } },
        { id: 'B2', label: 'B2', type: 't', metadata: { parent: 'G2', width: 90, height: 50 } },
        { id: 'B3', label: 'B3', type: 't', metadata: { parent: 'G2', width: 90, height: 50 } },
      ],
      edges: [
        { from: 'A1', to: 'A3' },
        { from: 'A2', to: 'A3' },
        { from: 'B1', to: 'B3' },
        { from: 'B2', to: 'B3' },
        // tie groups together
        { from: 'A3', to: 'B1' },
      ],
    }
    const layout = await layoutGraphDagre(data, { direction: 'RIGHT', nodeSpacing, rankSpacing })
    // Inner G1: A1/A2 same-rank; A1->A3 adjacent rank
    const A1 = center(layout.nodes.A1!)
    const A2 = center(layout.nodes.A2!)
    const A3 = center(layout.nodes.A3!)
    // LR: same-rank separation is primarily vertical; inter-rank is primarily horizontal
    const A1n = layout.nodes.A1!
    const A2n = layout.nodes.A2!
    const A3n = layout.nodes.A3!
    const expectedSame = nodeSpacing + A1n.height / 2 + A2n.height / 2
    const same = Math.abs(A2.y - A1.y)
    expect(same).toBeGreaterThanOrEqual(expectedSame - tol)
    expect(same).toBeLessThanOrEqual(expectedSame + tol)

    const expectedRank = rankSpacing + A1n.width / 2 + A3n.width / 2
    const rank = Math.abs(A3.x - A1.x)
    expect(rank).toBeGreaterThanOrEqual(expectedRank - tol)
    expect(rank).toBeLessThanOrEqual(expectedRank + tol)

    // Outer: compare group centres
    const g1c = bboxCenter(['A1', 'A2', 'A3'], layout.nodes)
    const g2c = bboxCenter(['B1', 'B2', 'B3'], layout.nodes)
    const outer = dominant(g2c.x - g1c.x, g2c.y - g1c.y)
    expect(outer).toBeGreaterThanOrEqual(rankSpacing - tol)
  })
})
