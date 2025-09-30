import dagre from 'dagre'

import type { GraphData } from '../graph'
import type { LayoutResult, PositionedEdge, PositionedNode } from './layout-core'
import type { UserLayoutOptions } from './elk-options'
import { getNodeDimensions } from './layout-core'

interface DagreNodeAttributes {
  width: number
  height: number
  x?: number
  y?: number
}

interface DagreEdgeAttributes {
  weight?: number
  points?: { x: number; y: number }[]
}

type DagreOptions = Partial<UserLayoutOptions> & {
  /** Mermaid-style spacing between nodes within a rank (Dagre `nodesep`). */
  nodeSpacing?: number
  /** Mermaid-style spacing between ranks (Dagre `ranksep`). */
  rankSpacing?: number
}

type RankDirection = 'TB' | 'BT' | 'LR' | 'RL'

function rankdir(direction: DagreOptions['direction']): RankDirection {
  const map: Record<string, 'TB' | 'BT' | 'LR' | 'RL'> = {
    DOWN: 'TB',
    UP: 'BT',
    LEFT: 'RL',
    RIGHT: 'LR',
  }
  return map[direction ?? 'RIGHT'] ?? 'LR'
}

function createDagreGraph(settings: {
  direction: DagreOptions['direction']
  nodesep: number
  ranksep: number
  edgesep: number
}): dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes> {
  const graph = new dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>({
    multigraph: true,
    compound: false,
  })
  graph.setGraph({
    rankdir: rankdir(settings.direction ?? 'RIGHT'),
    align: 'UL',
    nodesep: settings.nodesep,
    ranksep: settings.ranksep,
    edgesep: settings.edgesep,
    ranker: 'tight-tree',
  })
  graph.setDefaultEdgeLabel(() => ({}))
  return graph
}

function populateGraph(
  g: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
  data: GraphData,
): void {
  for (const node of data.nodes) {
    const dims = getNodeDimensions(node)
    g.setNode(node.id, { width: dims.width, height: dims.height })
  }
  let index = 0
  for (const edge of data.edges) {
    const weight = typeof edge.label === 'string' && /\byes\b/i.test(edge.label) ? 3 : 1
    g.setEdge(edge.from, edge.to, { weight }, `e${String(index)}`)
    index += 1
  }
}

function extractLayout(
  g: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
): LayoutResult {
  const nodeEntries: [string, PositionedNode][] = []
  for (const id of g.nodes()) {
    const nodeBox = g.node(id)
    if (
      !nodeBox ||
      typeof nodeBox.width !== 'number' ||
      typeof nodeBox.height !== 'number' ||
      typeof nodeBox.x !== 'number' ||
      typeof nodeBox.y !== 'number'
    ) {
      continue
    }
    nodeEntries.push([
      id,
      {
        id,
        x: nodeBox.x - nodeBox.width / 2,
        y: nodeBox.y - nodeBox.height / 2,
        width: nodeBox.width,
        height: nodeBox.height,
      },
    ])
  }
  const edges: PositionedEdge[] = []
  for (const edgeReference of g.edges()) {
    const info = g.edge(edgeReference)
    const pts = info?.points ?? []
    if (pts.length < 2) {
      continue
    }
    const [start, ...rest] = pts
    const end = rest.at(-1) ?? start
    const bends = rest.slice(0, Math.max(0, rest.length - 1))
    edges.push({
      startPoint: start,
      endPoint: end,
      bendPoints: bends.length > 0 ? bends : undefined,
    })
  }
  return { nodes: Object.fromEntries(nodeEntries), edges }
}

function baseLayoutGraphDagre(data: GraphData, options: DagreOptions = {}): LayoutResult {
  const defaultSpacing = typeof options.spacing === 'number' ? options.spacing : 60
  const nodesep = typeof options.nodeSpacing === 'number' ? options.nodeSpacing : defaultSpacing
  const ranksep = typeof options.rankSpacing === 'number' ? options.rankSpacing : defaultSpacing
  const g = createDagreGraph({
    direction: options.direction ?? 'RIGHT',
    nodesep,
    ranksep,
    edgesep: Math.max(10, Math.min(40, defaultSpacing / 3)),
  })
  populateGraph(g, data)
  dagre.layout(g)
  return extractLayout(g)
}

function hasSubgraphs(data: GraphData): boolean {
  return data.nodes.some((node) => {
    const meta = node.metadata as { parent?: string; isSubgraph?: boolean } | undefined
    if (typeof meta?.parent === 'string' && meta.parent.length > 0) {
      return true
    }
    return meta?.isSubgraph === true
  })
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

// Cluster structures for nested subgraphs
interface Cluster {
  id: string
  parent?: string
  childrenNodes: string[]
  childrenClusters: string[]
}

type ClusterTree = Map<string, Cluster>

function buildClusterTree(data: GraphData): ClusterTree {
  const clusters = new Map<string, Cluster>()
  const ensure = (id: string) => {
    let c = clusters.get(id)
    if (!c) {
      c = { id, childrenNodes: [], childrenClusters: [] }
      clusters.set(id, c)
    }
    return c
  }
  // Gather all subgraph containers
  for (const n of data.nodes) {
    const meta = n.metadata as { isSubgraph?: boolean; parent?: string } | undefined
    if (meta?.isSubgraph) {
      const c = ensure(n.id)
      if (meta.parent) {
        c.parent = meta.parent
        ensure(meta.parent).childrenClusters.push(n.id)
      }
    }
  }
  // Map leaf nodes to their immediate parent cluster
  for (const n of data.nodes) {
    const meta = n.metadata as { isSubgraph?: boolean; parent?: string } | undefined
    if (meta?.isSubgraph) continue
    if (meta?.parent) ensure(meta.parent).childrenNodes.push(n.id)
  }
  return clusters
}

function descendantLeaves(clusterId: string, tree: ClusterTree): Set<string> {
  const node = tree.get(clusterId)
  const out = new Set<string>()
  if (!node) return out
  for (const id of node.childrenNodes) out.add(id)
  for (const child of node.childrenClusters) {
    for (const v of descendantLeaves(child, tree)) out.add(v)
  }
  return out
}

function mapNodeToImmediateAt(
  nodeId: string,
  clusterId: string,
  tree: ClusterTree,
  data: GraphData,
): string | undefined {
  const c = tree.get(clusterId)
  if (!c) return undefined
  if (c.childrenNodes.includes(nodeId)) return nodeId
  let currentParent = getParentId(nodeId, data)
  while (currentParent) {
    const parentCluster = tree.get(currentParent)
    if (!parentCluster) break
    if (parentCluster.parent === clusterId) return currentParent
    currentParent = parentCluster.parent
  }
  return undefined
}

async function layoutClusterRecursive(
  clusterId: string,
  inheritedDirection: DagreOptions['direction'],
  data: GraphData,
  options: DagreOptions,
  tree: ClusterTree,
  sizes: Map<string, { width: number; height: number }>,
  innerLayouts: Map<string, LayoutResult>,
  constants: { padding: number; labelTopPadding: number; minProxyW: number; minProxyH: number },
): Promise<void> {
  const c = tree.get(clusterId)
  if (!c) return
  for (const sub of c.childrenClusters) {
    if (!sizes.has(sub)) {
      await layoutClusterRecursive(
        sub,
        inheritedDirection,
        data,
        options,
        tree,
        sizes,
        innerLayouts,
        constants,
      )
    }
  }
  const g = new dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>({
    multigraph: true,
    compound: false,
  })
  const defaultSpacing = typeof options.spacing === 'number' ? options.spacing : 60
  const nodesep = typeof options.nodeSpacing === 'number' ? options.nodeSpacing : defaultSpacing
  const ranksep = typeof options.rankSpacing === 'number' ? options.rankSpacing : defaultSpacing
  const leaves = descendantLeaves(clusterId, tree)
  const hasExternal = data.edges.some(
    (edge) =>
      (leaves.has(edge.from) && !leaves.has(edge.to)) ||
      (!leaves.has(edge.from) && leaves.has(edge.to)),
  )
  const directionLocal = hasExternal
    ? inheritedDirection
    : clusterDirection(clusterId, data, inheritedDirection)
  g.setGraph({
    rankdir: rankdirFor(directionLocal),
    align: 'UL',
    nodesep,
    ranksep,
    edgesep: Math.max(10, Math.min(40, defaultSpacing / 3)),
    ranker: 'tight-tree',
  })
  g.setDefaultEdgeLabel(() => ({}))
  for (const id of c.childrenNodes) {
    const node = data.nodes.find((n) => n.id === id)
    if (!node) continue
    const dims = getNodeDimensions(node)
    g.setNode(id, { width: dims.width, height: dims.height })
  }
  for (const id of c.childrenClusters) {
    const size = sizes.get(id) ?? { width: constants.minProxyW, height: constants.minProxyH }
    g.setNode(id, { width: size.width, height: size.height })
  }
  for (const [index, edge] of data.edges.entries()) {
    if (!leaves.has(edge.from) || !leaves.has(edge.to)) continue
    const from = mapNodeToImmediateAt(edge.from, clusterId, tree, data)
    const to = mapNodeToImmediateAt(edge.to, clusterId, tree, data)
    if (!from || !to) continue
    const weight = typeof edge.label === 'string' && /\byes\b/i.test(edge.label) ? 3 : 1
    g.setEdge(from, to, { weight }, `c${clusterId}:${String(index)}`)
  }
  dagre.layout(g)
  const nodes = new Map<string, PositionedNode>()
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const id of g.nodes()) {
    const nodeBox = g.node(id)
    if (
      !nodeBox ||
      typeof nodeBox.width !== 'number' ||
      typeof nodeBox.height !== 'number' ||
      typeof nodeBox.x !== 'number' ||
      typeof nodeBox.y !== 'number'
    ) {
      continue
    }
    const x = nodeBox.x - nodeBox.width / 2
    const y = nodeBox.y - nodeBox.height / 2
    nodes.set(id, { id, x, y, width: nodeBox.width, height: nodeBox.height })
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + nodeBox.width)
    maxY = Math.max(maxY, y + nodeBox.height)
  }
  const width = Math.max(constants.minProxyW, maxX - minX + constants.padding * 2)
  const height = Math.max(
    constants.minProxyH,
    maxY - minY + constants.padding * 2 + constants.labelTopPadding,
  )
  sizes.set(clusterId, { width, height })
  innerLayouts.set(clusterId, { nodes: Object.fromEntries(nodes), edges: [] })
}

function computeSide(
  parent: string,
  childId: string,
  innerLayouts: Map<string, LayoutResult>,
  sizes: Map<string, { width: number; height: number }>,
): 'N' | 'E' | 'S' | 'W' | undefined {
  const laid = innerLayouts.get(parent)
  if (!laid) return undefined
  const p = laid.nodes[childId]
  const proxy = sizes.get(parent)
  if (!p || !proxy) return undefined
  const box = boundingBox(laid.nodes)
  const cx = p.x + p.width / 2
  const cy = p.y + p.height / 2
  const distributionL = cx - box.minX
  const distributionR = box.maxX - cx
  const distributionT = cy - box.minY
  const distributionB = box.maxY - cy
  const min = Math.min(distributionL, distributionR, distributionT, distributionB)
  if (min === distributionL) return 'W'
  if (min === distributionR) return 'E'
  if (min === distributionT) return 'N'
  return 'S'
}

function clusterDirection(
  clusterId: string,
  data: GraphData,
  inherit: DagreOptions['direction'],
): DagreOptions['direction'] {
  const container = data.nodes.find((n) => n.id === clusterId)
  const declared = (
    container?.metadata as { subgraphDirection?: DagreOptions['direction'] } | undefined
  )?.subgraphDirection
  return declared ?? inherit
}

function rankdirFor(direction: DagreOptions['direction'] | undefined): 'TB' | 'BT' | 'LR' | 'RL' {
  return rankdir(direction ?? 'RIGHT')
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

  // Build cluster tree for nested subgraphs
  const tree = buildClusterTree(data)
  const sizes = new Map<string, { width: number; height: number }>()
  const innerLayouts = new Map<string, LayoutResult>()

  const constants = { padding, labelTopPadding, minProxyW, minProxyH }

  // Kick off recursive layout from all roots (clusters without parents)
  const roots = [...tree.values()].filter((c) => !c.parent).map((c) => c.id)
  const inheritedDirection = options.direction ?? 'RIGHT'
  for (const r of roots) {
    await layoutClusterRecursive(
      r,
      inheritedDirection,
      data,
      options,
      tree,
      sizes,
      innerLayouts,
      constants,
    )
  }

  // Build outer graph: top-level cluster proxies + top-level loose nodes
  const outerNodes: { id: string; width: number; height: number }[] = []
  const topLevelLoose = data.nodes.filter(
    (n) =>
      !(n.metadata as { parent?: string } | undefined)?.parent &&
      !(n.metadata as { isSubgraph?: boolean } | undefined)?.isSubgraph,
  )
  for (const id of roots) {
    const size = sizes.get(id) ?? { width: minProxyW, height: minProxyH }
    outerNodes.push({ id, width: size.width, height: size.height })
  }
  for (const n of topLevelLoose) {
    const d = getNodeDimensions(n)
    outerNodes.push({ id: n.id, width: d.width, height: d.height })
  }

  // Collapse edges for outer level: endpoints map to root cluster ids or loose node ids
  interface OuterEdge {
    from: string
    to: string
    sourceIdx: number
  }
  const outerEdges: OuterEdge[] = []
  type EdgeHintSide = 'N' | 'E' | 'S' | 'W'
  const edgeSideHints = new Map<number, { from?: EdgeHintSide; to?: EdgeHintSide }>()

  // Helper to find root container for a node
  const rootOf = (nodeId: string): string | undefined => {
    let p = getParentId(nodeId, data)
    let last: string | undefined
    while (p) {
      last = p
      p = tree.get(p)?.parent
    }
    return last
  }

  // Side hints: compute based on immediate cluster inner layout where endpoint resides
  const computeSideLocal = (parent: string, childId: string): EdgeHintSide | undefined =>
    computeSide(parent, childId, innerLayouts, sizes)

  for (const [index, edgeItem] of data.edges.entries()) {
    const rf = rootOf(edgeItem.from)
    const rt = rootOf(edgeItem.to)
    // Internal edges fully within a single root cluster are handled inside during expansion; skip here
    if (rf && rt && rf === rt) {
      continue
    }
    const ofrom = rf ?? edgeItem.from
    const oto = rt ?? edgeItem.to
    outerEdges.push({ from: ofrom, to: oto, sourceIdx: index })
    const hint: { from?: EdgeHintSide; to?: EdgeHintSide } = {}
    if (rf) hint.from = computeSideLocal(rf, edgeItem.from)
    if (rt) hint.to = computeSideLocal(rt, edgeItem.to)
    edgeSideHints.set(index, hint)
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
  const outerLayout = baseLayoutGraphDagre(outerGraph, options)

  // Compose final nodes and edges by expanding clusters recursively
  const finalNodes: Record<string, PositionedNode> = {}
  const finalEdges: PositionedEdge[] = []

  // Place top-level loose nodes
  for (const n of topLevelLoose) {
    const pos = outerLayout.nodes[n.id]
    if (!pos) continue
    finalNodes[n.id] = { id: n.id, x: pos.x, y: pos.y, width: pos.width, height: pos.height }
  }

  // Expand clusters depth-first
  const expandCluster = (clusterId: string): void => {
    const proxy = outerLayout.nodes[clusterId]
    if (!proxy) return
    // Record proxy itself so GraphProcessor can size frames directly
    finalNodes[clusterId] = {
      id: clusterId,
      x: proxy.x,
      y: proxy.y,
      width: proxy.width,
      height: proxy.height,
    }
    const offX = proxy.x + padding
    const offY = proxy.y + padding
    const layout = innerLayouts.get(clusterId)
    const cluster = tree.get(clusterId)
    if (layout && cluster) {
      // place immediate leaves
      for (const id of cluster.childrenNodes) {
        const p = layout.nodes[id]
        if (!p) continue
        finalNodes[id] = { id, x: p.x + offX, y: p.y + offY, width: p.width, height: p.height }
      }
      // place child cluster proxies and recurse
      for (const sub of cluster.childrenClusters) {
        const p = layout.nodes[sub]
        if (!p) continue
        // Create a synthetic node for child proxy relative to parent to support deeper expansion
        // Store absolute proxy position into outerLayout-like map for recursion: hack by adding to finalNodes
        finalNodes[sub] = {
          id: sub,
          x: p.x + offX,
          y: p.y + offY,
          width: p.width,
          height: p.height,
        }
      }
      // Recurse after proxies recorded; use stored absolute position via finalNodes
      for (const sub of cluster.childrenClusters) {
        // For recursion, emulate that this proxy is available in outerLayout by creating a tiny view
        // We will call a local expansion that uses finalNodes for proxy lookups
        const pos = finalNodes[sub]
        if (!pos) continue
        // Temporarily inject into outerLayout-like structure for this recursion step
        // Simpler: directly place leaves of sub with offset pos.x+padding, pos.y+padding in a nested expand
        const subLayout = innerLayouts.get(sub)
        if (!subLayout) continue
        const subCluster = tree.get(sub)
        if (!subCluster) continue
        const subOffX = pos.x + padding
        const subOffY = pos.y + padding
        for (const id of subCluster.childrenNodes) {
          const p2 = subLayout.nodes[id]
          if (!p2) continue
          finalNodes[id] = {
            id,
            x: p2.x + subOffX,
            y: p2.y + subOffY,
            width: p2.width,
            height: p2.height,
          }
        }
        // Place grand-child proxies and keep drilling one level more by recursion
        for (const subsub of subCluster.childrenClusters) {
          const p3 = subLayout.nodes[subsub]
          if (p3) {
            finalNodes[subsub] = {
              id: subsub,
              x: p3.x + subOffX,
              y: p3.y + subOffY,
              width: p3.width,
              height: p3.height,
            }
          }
        }
        // Recurse deeper
        if (subCluster.childrenClusters.length > 0) {
          // Call expandCluster recursively; rely on finalNodes[sub] acting as proxy

          expandCluster(sub, subOffX - padding, subOffY - padding)
        }
      }
    }
  }

  for (const r of roots) expandCluster(r)

  // Internal edge paths: we will only include those between immediate leaves within each cluster
  // Offset them to absolute using recorded proxy positions in finalNodes
  for (const [cid, layout] of innerLayouts) {
    const cluster = tree.get(cid)
    if (!cluster) continue
    const proxy = finalNodes[cid]
    if (!proxy) continue
    const off = { x: proxy.x + padding, y: proxy.y + padding }
    // Build local dagre again to harvest edges in the same order as layout.edges (empty in our innerLayouts)
    // Simpler: recompute edges between immediate leaves only
    for (const edge of data.edges) {
      if (!cluster.childrenNodes.includes(edge.from) || !cluster.childrenNodes.includes(edge.to))
        continue
      // There is no stored edge path array; approximate with straight segment between centres within cluster
      const s = layout.nodes[edge.from]
      const t = layout.nodes[edge.to]
      if (s && t) {
        finalEdges.push({
          startPoint: { x: s.x + off.x + s.width / 2, y: s.y + off.y + s.height / 2 },
          endPoint: { x: t.x + off.x + t.width / 2, y: t.y + off.y + t.height / 2 },
        })
      }
    }
  }

  // Add outer edge paths per outerLayout (with hintSides calculated earlier)
  for (const [index, outerEdge] of outerEdges.entries()) {
    const orig = outerEdge.sourceIdx
    const epos = outerLayout.edges[index]
    if (epos) {
      finalEdges.push({
        startPoint: epos.startPoint,
        endPoint: epos.endPoint,
        bendPoints: epos.bendPoints,
        hintSides: { start: edgeSideHints.get(orig)?.from, end: edgeSideHints.get(orig)?.to },
      })
    }
  }

  return { nodes: finalNodes, edges: finalEdges }
}
