import dagre from 'dagre'

import type { GraphData } from '../graph'
import type { LayoutResult, PositionedEdge, PositionedNode } from './layout-core'
import type { UserLayoutOptions } from './elk-options'
import { getNodeDimensions } from './layout-core'

type DagreOptions = Partial<UserLayoutOptions> & {
  /** Mermaid-style spacing between nodes within a rank (Dagre `nodesep`). */
  nodeSpacing?: number
  /** Mermaid-style spacing between ranks (Dagre `ranksep`). */
  rankSpacing?: number
}

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

async function baseLayoutGraphDagre(
  data: GraphData,
  options: DagreOptions = {},
): Promise<LayoutResult> {
  const g = new dagre.graphlib.Graph({ multigraph: true, compound: false })
  const dir = rankdir(options.direction ?? 'RIGHT')
  // Dagre expects `nodesep` and `ranksep`. Prefer explicit `nodeSpacing`/`rankSpacing`
  // when provided (from Mermaid), otherwise fall back to a single `spacing` knob.
  const defaultSpacing = typeof options.spacing === 'number' ? options.spacing : 60
  const nodesep = typeof options.nodeSpacing === 'number' ? options.nodeSpacing : defaultSpacing
  const ranksep = typeof options.rankSpacing === 'number' ? options.rankSpacing : defaultSpacing
  g.setGraph({
    rankdir: dir,
    // Align nodes to the upper edge of each rank to avoid "staircase" drift
    align: 'UL',
    // Standard dagre tunables
    nodesep,
    ranksep,
    edgesep: Math.max(10, Math.min(40, defaultSpacing / 3)),
    ranker: 'tight-tree',
    // acyclicer left as default to avoid over-constraining in complex graphs
  })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of data.nodes) {
    const dims = getNodeDimensions(node)
    g.setNode(node.id, { width: dims.width, height: dims.height })
  }
  for (const [index, edge] of data.edges.entries()) {
    const weight = typeof edge.label === 'string' && /\byes\b/i.test(edge.label) ? 3 : 1
    g.setEdge(edge.from, edge.to, { weight }, `e${index}`)
  }

  dagre.layout(g)

  // Use Dagre's computed coordinates as-is to preserve spacing semantics.

  const nodes: Record<string, PositionedNode> = {}
  g.nodes().forEach((id: string) => {
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
  g.edges().forEach((e: { v: string; w: string; name?: string }) => {
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

function hasSubgraphs(data: GraphData): boolean {
  return data.nodes.some(
    (n) =>
      (n.metadata as { parent?: string; isSubgraph?: boolean } | undefined)?.parent ||
      (n.metadata as { parent?: string; isSubgraph?: boolean } | undefined)?.isSubgraph,
  )
}

function getParentId(nodeId: string, data: GraphData): string | undefined {
  const n = data.nodes.find((x) => x.id === nodeId)
  const meta = n?.metadata as { parent?: string } | undefined
  return meta?.parent
}

function isSubgraphNode(id: string, data: GraphData): boolean {
  const n = data.nodes.find((x) => x.id === id)
  return (
    (n?.metadata as { isSubgraph?: boolean } | undefined)?.isSubgraph === true ||
    n?.type === 'Composite'
  )
}

function boundingBox(nodes: Record<string, PositionedNode>): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const v of Object.values(nodes)) {
    minX = Math.min(minX, v.x)
    minY = Math.min(minY, v.y)
    maxX = Math.max(maxX, v.x + v.width)
    maxY = Math.max(maxY, v.y + v.height)
  }
  return { minX, minY, maxX, maxY }
}

export async function layoutGraphDagre(
  data: GraphData,
  options: DagreOptions = {},
): Promise<LayoutResult> {
  if (!hasSubgraphs(data)) {
    return baseLayoutGraphDagre(data, options)
  }
  const padding = 32
  const labelTopPadding = 20
  const minProxyW = 120
  const minProxyH = 80
  // Build membership map: parent -> children
  const children = new Map<string, string[]>()
  for (const n of data.nodes) {
    const parent = (n.metadata as { parent?: string } | undefined)?.parent
    if (!parent) continue
    const list = children.get(parent) ?? []
    list.push(n.id)
    children.set(parent, list)
  }
  // Build inner layouts per subgraph
  const innerLayouts = new Map<string, LayoutResult>()
  const proxySizes = new Map<string, { width: number; height: number }>()
  for (const [name, members] of children) {
    const subNodes = data.nodes.filter((n) => members.includes(n.id))
    const subEdges = data.edges.filter((e) => members.includes(e.from) && members.includes(e.to))
    const subgraph: GraphData = { nodes: subNodes, edges: subEdges }
    // Mermaid rule: if any child links to outside, ignore subgraph local direction and inherit parent.
    const memberSet = new Set(members)
    const hasExternal = data.edges.some(
      (e) =>
        (memberSet.has(e.from) && !memberSet.has(e.to)) ||
        (!memberSet.has(e.from) && memberSet.has(e.to)),
    )
    const container = data.nodes.find((n) => n.id === name)
    const declaredDir = (
      container?.metadata as { subgraphDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' } | undefined
    )?.subgraphDirection
    const innerDir = hasExternal ? options.direction : (declaredDir ?? options.direction)
    const laid = await baseLayoutGraphDagre(subgraph, { ...options, direction: innerDir })
    innerLayouts.set(name, laid)
    const box = boundingBox(laid.nodes)
    const width = Math.max(minProxyW, box.maxX - box.minX + padding * 2)
    const height = Math.max(minProxyH, box.maxY - box.minY + padding * 2 + labelTopPadding)
    proxySizes.set(name, { width, height })
  }
  // Build outer graph of proxies + top-level nodes
  const topLevelNodes = data.nodes.filter(
    (n) =>
      !(n.metadata as { parent?: string } | undefined)?.parent &&
      !(n.metadata as { isSubgraph?: boolean } | undefined)?.isSubgraph,
  )
  const outerNodes: { id: string; width: number; height: number }[] = []
  for (const [name, size] of proxySizes) {
    outerNodes.push({ id: name, width: size.width, height: size.height })
  }
  for (const n of topLevelNodes) {
    const dims = getNodeDimensions(n)
    outerNodes.push({ id: n.id, width: dims.width, height: dims.height })
  }
  // Outer edges collapse cross-subgraph edges to proxy<->proxy (or proxy<->node)
  type OuterEdge = { from: string; to: string; sourceIdx: number }
  const outerEdges: OuterEdge[] = []
  type EdgeHintSide = 'N' | 'E' | 'S' | 'W'
  const edgeSideHints = new Map<number, { from?: EdgeHintSide; to?: EdgeHintSide }>()
  const internalEdgeMap = new Map<number, { parent: string }>()
  for (const [idx, e] of data.edges.entries()) {
    const pFrom = getParentId(e.from, data)
    const pTo = getParentId(e.to, data)
    if (pFrom && pTo && pFrom === pTo) {
      internalEdgeMap.set(idx, { parent: pFrom })
      continue
    }
    const ofrom = pFrom ?? e.from
    const oto = pTo ?? e.to
    outerEdges.push({ from: ofrom, to: oto, sourceIdx: idx })
    // Compute side hints based on inner coordinates when inside a subgraph
    const computeSide = (
      parent: string,
      childId: string,
      laid: LayoutResult,
      proxy: { width: number; height: number },
    ): EdgeHintSide | undefined => {
      const p = laid.nodes[childId]
      if (!p) return undefined
      const box = boundingBox(laid.nodes)
      const cx = p.x + p.width / 2
      const cy = p.y + p.height / 2
      const distL = cx - box.minX
      const distR = box.maxX - cx
      const distT = cy - box.minY
      const distB = box.maxY - cy
      const min = Math.min(distL, distR, distT, distB)
      if (min === distL) return 'W'
      if (min === distR) return 'E'
      if (min === distT) return 'N'
      return 'S'
    }
    const hint: { from?: EdgeHintSide; to?: EdgeHintSide } = {}
    if (pFrom) {
      const laid = innerLayouts.get(pFrom)
      const proxy = proxySizes.get(pFrom)
      if (laid && proxy) hint.from = computeSide(pFrom, e.from, laid, proxy)
    }
    if (pTo) {
      const laid = innerLayouts.get(pTo)
      const proxy = proxySizes.get(pTo)
      if (laid && proxy) hint.to = computeSide(pTo, e.to, laid, proxy)
    }
    edgeSideHints.set(idx, hint)
  }
  const outerGraph: GraphData = {
    nodes: outerNodes.map((n) => ({
      id: n.id,
      label: n.id,
      type: isSubgraphNode(n.id, data)
        ? 'Composite'
        : (data.nodes.find((x) => x.id === n.id)?.type ?? 'MermaidNode'),
      metadata: { width: n.width, height: n.height },
    })),
    edges: outerEdges.map((e) => ({ from: e.from, to: e.to })),
  }
  // Run outer Dagre using provided sizes (metadata width/height honored by getNodeDimensions)
  const outerLayout = await baseLayoutGraphDagre(outerGraph, options)
  // Compose final nodes: top-level nodes + inner members offset by proxy position + padding
  const finalNodes: Record<string, PositionedNode> = {}
  // Place top-level nodes
  for (const n of topLevelNodes) {
    const pos = outerLayout.nodes[n.id]
    if (!pos) continue
    finalNodes[n.id] = { id: n.id, x: pos.x, y: pos.y, width: pos.width, height: pos.height }
  }
  // Place inner nodes per subgraph
  for (const [name, laid] of innerLayouts) {
    const proxy = outerLayout.nodes[name]
    if (!proxy) continue
    const offsetX = proxy.x + padding
    const offsetY = proxy.y + padding
    for (const [id, p] of Object.entries(laid.nodes)) {
      finalNodes[id] = { id, x: p.x + offsetX, y: p.y + offsetY, width: p.width, height: p.height }
    }
  }
  // Build edges in original order: use inner paths for internal edges, outer paths for collapsed ones
  const finalEdges: PositionedEdge[] = []
  // Build lookup for internal edges layout
  const internalEdgeLayouts = new Map<number, PositionedEdge>()
  for (const [parent, laid] of innerLayouts) {
    // Map from subgraph edge order to corresponding original indices
    const members = new Set(children.get(parent) ?? [])
    const subEdges = data.edges
      .map((e, idx) => ({ e, idx }))
      .filter(({ e }) => members.has(e.from) && members.has(e.to))
    for (let i = 0; i < subEdges.length; i += 1) {
      const originalIdx = subEdges[i]!.idx
      const edgePos = laid.edges[i]
      if (!edgePos) continue
      // Offset by proxy position + padding
      const proxy = outerLayout.nodes[parent]
      if (!proxy) continue
      const off = { x: proxy.x + padding, y: proxy.y + padding }
      const bendPoints = edgePos.bendPoints?.map((b) => ({ x: b.x + off.x, y: b.y + off.y }))
      internalEdgeLayouts.set(originalIdx, {
        startPoint: { x: edgePos.startPoint.x + off.x, y: edgePos.startPoint.y + off.y },
        endPoint: { x: edgePos.endPoint.x + off.x, y: edgePos.endPoint.y + off.y },
        bendPoints,
      })
    }
  }
  // Map outer edges by original index
  const outerEdgeByOriginal = new Map<number, PositionedEdge>()
  for (let i = 0; i < outerEdges.length; i += 1) {
    const orig = outerEdges[i]!.sourceIdx
    const epos = outerLayout.edges[i]
    if (epos) {
      outerEdgeByOriginal.set(orig, {
        startPoint: epos.startPoint,
        endPoint: epos.endPoint,
        bendPoints: epos.bendPoints,
        hintSides: { start: edgeSideHints.get(orig)?.from, end: edgeSideHints.get(orig)?.to },
      })
    }
  }
  for (let i = 0; i < data.edges.length; i += 1) {
    const internal = internalEdgeMap.get(i)
    const edge = internal ? internalEdgeLayouts.get(i) : outerEdgeByOriginal.get(i)
    if (edge) {
      finalEdges.push(edge)
    } else {
      // Fallback: straight line between centers
      const e = data.edges[i]!
      const s = finalNodes[e.from]
      const t = finalNodes[e.to]
      if (s && t) {
        finalEdges.push({
          startPoint: { x: s.x + s.width / 2, y: s.y + s.height / 2 },
          endPoint: { x: t.x + t.width / 2, y: t.y + t.height / 2 },
        })
      }
    }
  }
  return { nodes: finalNodes, edges: finalEdges }
}
