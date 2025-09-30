import { describe, expect, it } from 'vitest'

import type { GraphData } from '../../src/core/graph'
import type { PositionedNode } from '../../src/core/layout/layout-core'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

function requireNode(candidate: PositionedNode | undefined, label: string): PositionedNode {
  expect(candidate, `${label} should be defined`).toBeDefined()
  return candidate as PositionedNode
}

describe('dagre layout', () => {
  it('lays out a simple flowchart left-to-right', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'start', label: 'Start', type: 'MermaidNode' },
        { id: 'end', label: 'End', type: 'MermaidNode' },
      ],
      edges: [{ from: 'start', to: 'end', label: 'yes' }],
    }

    const result = await layoutGraphDagre(data, { direction: 'RIGHT', spacing: 80 })

    const start = requireNode(result.nodes.start, 'start node')
    const end = requireNode(result.nodes.end, 'end node')
    expect(start.x).toBeLessThan(end.x)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]?.startPoint.x).toBeLessThan(result.edges[0]?.endPoint.x ?? Infinity)
  })

  it('expands clustered nodes within proxy bounds', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'cluster', label: 'Group', type: 'Composite', metadata: { isSubgraph: true } },
        { id: 'n1', label: 'First', type: 'MermaidNode', metadata: { parent: 'cluster' } },
        { id: 'n2', label: 'Second', type: 'MermaidNode', metadata: { parent: 'cluster' } },
        { id: 'loose', label: 'Loose', type: 'MermaidNode' },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'loose' },
      ],
    }

    const result = await layoutGraphDagre(data, { direction: 'DOWN', spacing: 70 })

    const proxy = requireNode(result.nodes.cluster, 'cluster proxy')
    const first = requireNode(result.nodes.n1, 'first child')
    const second = requireNode(result.nodes.n2, 'second child')

    const proxyRight = proxy.x + proxy.width
    const proxyBottom = proxy.y + proxy.height

    expect(first.x).toBeGreaterThanOrEqual(proxy.x)
    expect(first.x + first.width).toBeLessThanOrEqual(proxyRight)
    expect(second.y).toBeGreaterThanOrEqual(proxy.y)
    expect(second.y + second.height).toBeLessThanOrEqual(proxyBottom)

    const loose = requireNode(result.nodes.loose, 'loose node')
    expect(loose.y).toBeGreaterThan(proxy.y)
  })
})
