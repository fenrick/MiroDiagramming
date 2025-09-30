import { describe, expect, it } from 'vitest'

import type { GraphData } from '../../src/core/graph'
import type { PositionedNode } from '../../src/core/layout/layout-core'
import { layoutGraphDagre } from '../../src/core/layout/dagre-layout'

function requireNode(candidate: PositionedNode | undefined, label: string): PositionedNode {
  expect(candidate, `${label} should be defined`).toBeDefined()
  if (!candidate) {
    throw new Error(`${label} should be defined`)
  }
  return candidate
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

  it('provides hint sides and nested proxies for multi-level clusters', async () => {
    const data: GraphData = {
      nodes: [
        { id: 'outer', label: 'Outer', type: 'Composite', metadata: { isSubgraph: true } },
        {
          id: 'inner',
          label: 'Inner',
          type: 'Composite',
          metadata: { isSubgraph: true, parent: 'outer' },
        },
        { id: 'leaf-a', label: 'Leaf A', type: 'MermaidNode', metadata: { parent: 'inner' } },
        { id: 'leaf-b', label: 'Leaf B', type: 'MermaidNode', metadata: { parent: 'inner' } },
        {
          id: 'outer-leaf',
          label: 'Outer Leaf',
          type: 'MermaidNode',
          metadata: { parent: 'outer' },
        },
        { id: 'lonely', label: 'Lonely', type: 'MermaidNode' },
      ],
      edges: [
        { from: 'leaf-a', to: 'leaf-b' },
        { from: 'leaf-b', to: 'outer-leaf' },
        { from: 'outer-leaf', to: 'lonely' },
      ],
    }

    const result = await layoutGraphDagre(data, { direction: 'RIGHT', spacing: 60 })

    const outerProxy = requireNode(result.nodes.outer, 'outer cluster proxy')
    const innerProxy = requireNode(result.nodes.inner, 'inner cluster proxy')

    // Inner cluster should reside within the outer cluster padded bounds.
    expect(innerProxy.x).toBeGreaterThanOrEqual(outerProxy.x)
    expect(innerProxy.y).toBeGreaterThanOrEqual(outerProxy.y)
    expect(innerProxy.x + innerProxy.width).toBeLessThanOrEqual(outerProxy.x + outerProxy.width)
    expect(innerProxy.y + innerProxy.height).toBeLessThanOrEqual(outerProxy.y + outerProxy.height)

    // Outgoing edge from cluster should carry hint sides for routing.
    const hintedEdge = result.edges.find((edge) => {
      const hints = edge.hintSides
      return (hints?.start ?? hints?.end) !== undefined
    })
    expect(hintedEdge).toBeDefined()

    const outerLeaf = requireNode(result.nodes['outer-leaf'], 'outer leaf')
    expect(outerLeaf.x).toBeGreaterThanOrEqual(outerProxy.x)
    expect(outerLeaf.x + outerLeaf.width).toBeLessThanOrEqual(outerProxy.x + outerProxy.width)
  })
})
