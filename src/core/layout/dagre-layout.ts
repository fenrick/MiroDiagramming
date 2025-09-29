import dagre from 'dagre'

import type { GraphData } from '../graph'
import type { LayoutResult, PositionedEdge, PositionedNode } from './layout-core'
import type { UserLayoutOptions } from './elk-options'
import { getNodeDimensions } from './layout-core'

type DagreOptions = Partial<UserLayoutOptions>

function rankdir(direction: DagreOptions['direction']): 'TB' | 'BT' | 'LR' | 'RL' {
  switch (direction) {
    case 'DOWN':
      return 'TB'
    case 'UP':
      return 'BT'
    case 'LEFT':
      return 'RL'
    case 'RIGHT':
    default:
      return 'LR'
  }
}

export async function layoutGraphDagre(
  data: GraphData,
  options: DagreOptions = {},
): Promise<LayoutResult> {
  const g = new dagre.graphlib.Graph({ multigraph: true, compound: false })
  const dir = rankdir(options.direction ?? 'RIGHT')
  g.setGraph({
    rankdir: dir,
    // Align nodes to the upper edge of each rank to avoid "staircase" drift
    align: 'UL',
    // Standard dagre tunables
    nodesep: options.spacing ?? 60,
    ranksep: options.spacing ?? 60,
    edgesep: Math.max(10, Math.min(40, (options.spacing ?? 60) / 3)),
    ranker: 'network-simplex',
  })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of data.nodes) {
    const dims = getNodeDimensions(node)
    g.setNode(node.id, { width: dims.width, height: dims.height })
  }
  for (const [index, edge] of data.edges.entries()) {
    g.setEdge(edge.from, edge.to, {}, `e${index}`)
  }

  dagre.layout(g)

  // Snap coordinates per-rank to remove small vertical drift across LR ranks (or horizontal for TB)
  const byRank = new Map<
    number,
    Array<{ id: string; x: number; y: number; w: number; h: number }>
  >()
  g.nodes().forEach((id: string) => {
    const n = g.node(id) as { x: number; y: number; width: number; height: number; rank?: number }
    const r = typeof n.rank === 'number' ? n.rank : 0
    const list = byRank.get(r) ?? []
    list.push({ id, x: n.x, y: n.y, w: n.width, h: n.height })
    byRank.set(r, list)
  })
  if (byRank.size > 0) {
    for (const [, list] of byRank) {
      if (dir === 'LR' || dir === 'RL') {
        const medianY = list.toSorted((a, b) => a.y - b.y)[Math.floor(list.length / 2)]!.y
        // write back snapped y
        for (const node of list) {
          const nn = g.node(node.id) as { y: number }
          nn.y = medianY
        }
      } else {
        const medianX = list.toSorted((a, b) => a.x - b.x)[Math.floor(list.length / 2)]!.x
        for (const node of list) {
          const nn = g.node(node.id) as { x: number }
          nn.x = medianX
        }
      }
    }
  }

  const nodes: Record<string, PositionedNode> = {}
  g.nodes().forEach((id) => {
    const n = g.node(id) as { x: number; y: number; width: number; height: number }
    nodes[id] = {
      id,
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
      width: n.width,
      height: n.height,
    }
  })

  const edges: PositionedEdge[] = []
  g.edges().forEach((e) => {
    const info = g.edge(e) as { points?: Array<{ x: number; y: number }> }
    const pts = info.points ?? []
    if (pts.length >= 2) {
      const start = pts[0]!
      const end = pts[pts.length - 1]!
      const bends = pts.slice(1, -1)
      edges.push({
        startPoint: start,
        endPoint: end,
        bendPoints: bends.length ? bends : undefined,
      })
    }
  })

  return { nodes, edges }
}
