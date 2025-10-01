import dagre from 'dagre'

import type { GraphData } from '../graph'
import type { EdgeData } from '../graph/graph-service'
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
  points?: DagrePoint[]
}

interface DagrePoint {
  x: number
  y: number
}

type DagreOptions = Partial<UserLayoutOptions> & {
  /** Mermaid-style spacing between nodes within a rank (Dagre `nodesep`). */
  nodeSpacing?: number
  /** Mermaid-style spacing between ranks (Dagre `ranksep`). */
  rankSpacing?: number
}

type RankDirection = 'TB' | 'BT' | 'LR' | 'RL'

type EdgeHintSide = 'N' | 'E' | 'S' | 'W'

type ClusterTree = Map<string, Cluster>

type ClusterLayouts = Map<string, ClusterLayoutInfo>

type ClusterEdgeMap = Map<string, EdgeData[]>

interface Cluster {
  id: string
  parent?: string
  childrenNodes: string[]
  childrenClusters: string[]
}

interface ClusterLayoutInfo {
  size: { width: number; height: number }
  positions: Map<string, PositionedNode>
}

interface OuterEdgeInfo {
  from: string
  to: string
  sourceIndex: number
}

interface ExpansionContext {
  tree: ClusterTree
  layouts: ClusterLayouts
  directEdges: ClusterEdgeMap
  finalNodes: Map<string, PositionedNode>
  finalEdges: PositionedEdge[]
}

const DEFAULT_SPACING = 60
const MIN_EDGE_SEPARATION = 10
const MAX_EDGE_SEPARATION = 40
const CLUSTER_PADDING = 32
const CLUSTER_LABEL_PADDING = 20
const CLUSTER_MIN_WIDTH = 120
const CLUSTER_MIN_HEIGHT = 80

function rankdir(direction: DagreOptions['direction']): RankDirection {
  const map: Record<string, RankDirection> = {
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
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
  data: GraphData,
): void {
  for (const node of data.nodes) {
    const dimensions = getNodeDimensions(node)
    graph.setNode(node.id, { width: dimensions.width, height: dimensions.height })
  }
  let index = 0
  for (const edge of data.edges) {
    const weight = typeof edge.label === 'string' && /\byes\b/i.test(edge.label) ? 3 : 1
    graph.setEdge(edge.from, edge.to, { weight }, `e${String(index)}`)
    index += 1
  }
}

function toPositionedNode(id: string, nodeBox: DagreNodeAttributes): PositionedNode | undefined {
  if (
    typeof nodeBox.width !== 'number' ||
    typeof nodeBox.height !== 'number' ||
    typeof nodeBox.x !== 'number' ||
    typeof nodeBox.y !== 'number'
  ) {
    return undefined
  }
  return {
    id,
    x: nodeBox.x - nodeBox.width / 2,
    y: nodeBox.y - nodeBox.height / 2,
    width: nodeBox.width,
    height: nodeBox.height,
  }
}

function extractLayoutNodes(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
): [string, PositionedNode][] {
  const entries: [string, PositionedNode][] = []
  for (const id of graph.nodes()) {
    const nodeBox = graph.node(id)
    if (!nodeBox) {
      continue
    }
    const positioned = toPositionedNode(id, nodeBox)
    if (positioned) {
      entries.push([id, positioned])
    }
  }
  return entries
}

const toPositionedEdge = (points: readonly DagrePoint[] | undefined): PositionedEdge | null => {
  if (!points || points.length < 2) {
    return null
  }
  const start = points[0]
  const end = points.at(-1)
  if (!start || !end) {
    return null
  }
  const bendPoints = points.length > 2 ? points.slice(1, -1) : []
  return {
    startPoint: start,
    endPoint: end,
    bendPoints: bendPoints.length > 0 ? bendPoints : undefined,
  }
}

function extractLayoutEdges(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
): PositionedEdge[] {
  const edges: PositionedEdge[] = []
  for (const edgeReference of graph.edges()) {
    const edgeValue = graph.edge(edgeReference)
    const positioned = toPositionedEdge(edgeValue?.points)
    if (positioned) {
      edges.push(positioned)
    }
  }
  return edges
}

function extractLayout(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
): LayoutResult {
  const nodes = Object.fromEntries(extractLayoutNodes(graph))
  const edges = extractLayoutEdges(graph)
  return { nodes, edges }
}

function baseLayoutGraphDagre(data: GraphData, options: DagreOptions = {}): LayoutResult {
  const spacing = typeof options.spacing === 'number' ? options.spacing : DEFAULT_SPACING
  const nodesep = typeof options.nodeSpacing === 'number' ? options.nodeSpacing : spacing
  const ranksep = typeof options.rankSpacing === 'number' ? options.rankSpacing : spacing
  const graph = createDagreGraph({
    direction: options.direction ?? 'RIGHT',
    nodesep,
    ranksep,
    edgesep: Math.max(MIN_EDGE_SEPARATION, Math.min(MAX_EDGE_SEPARATION, spacing / 3)),
  })
  populateGraph(graph, data)
  dagre.layout(graph)
  return extractLayout(graph)
}

function hasSubgraphs(data: GraphData): boolean {
  return data.nodes.some((node) => {
    const metadata = node.metadata as { parent?: string; isSubgraph?: boolean } | undefined
    if (typeof metadata?.parent === 'string' && metadata.parent.length > 0) {
      return true
    }
    return metadata?.isSubgraph === true
  })
}

function getParentId(nodeId: string, data: GraphData): string | undefined {
  const node = data.nodes.find((candidate) => candidate.id === nodeId)
  const metadata = node?.metadata as { parent?: string } | undefined
  return metadata?.parent
}

function isSubgraphNode(id: string, data: GraphData): boolean {
  const node = data.nodes.find((candidate) => candidate.id === id)
  return (
    (node?.metadata as { isSubgraph?: boolean } | undefined)?.isSubgraph === true ||
    node?.type === 'Composite'
  )
}

function boundingBox(nodes: Iterable<PositionedNode>): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  let hasValues = false
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const node of nodes) {
    hasValues = true
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.width)
    maxY = Math.max(maxY, node.y + node.height)
  }
  if (!hasValues) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  return { minX, minY, maxX, maxY }
}

function buildClusterTree(data: GraphData): ClusterTree {
  const clusters = new Map<string, Cluster>()
  const ensureCluster = (id: string): Cluster => {
    const existing = clusters.get(id)
    if (existing) {
      return existing
    }
    const created: Cluster = { id, childrenNodes: [], childrenClusters: [] }
    clusters.set(id, created)
    return created
  }
  const registerSubgraph = (node: GraphData['nodes'][number]): void => {
    const metadata = node.metadata as { isSubgraph?: boolean; parent?: string } | undefined
    if (!metadata?.isSubgraph) {
      return
    }
    const cluster = ensureCluster(node.id)
    if (metadata.parent) {
      cluster.parent = metadata.parent
      ensureCluster(metadata.parent).childrenClusters.push(node.id)
    }
  }
  const mapLeafNode = (node: GraphData['nodes'][number]): void => {
    const metadata = node.metadata as { isSubgraph?: boolean; parent?: string } | undefined
    if (metadata?.isSubgraph || !metadata?.parent) {
      return
    }
    ensureCluster(metadata.parent).childrenNodes.push(node.id)
  }
  for (const node of data.nodes) {
    registerSubgraph(node)
  }
  for (const node of data.nodes) {
    mapLeafNode(node)
  }
  return clusters
}

function descendantLeaves(clusterId: string, tree: ClusterTree): Set<string> {
  const cluster = tree.get(clusterId)
  const result = new Set<string>()
  if (!cluster) {
    return result
  }
  for (const id of cluster.childrenNodes) {
    result.add(id)
  }
  for (const child of cluster.childrenClusters) {
    for (const leaf of descendantLeaves(child, tree)) {
      result.add(leaf)
    }
  }
  return result
}

function mapNodeToImmediateAncestor(
  nodeId: string,
  clusterId: string,
  tree: ClusterTree,
  data: GraphData,
): string | undefined {
  const cluster = tree.get(clusterId)
  if (!cluster) {
    return undefined
  }
  if (cluster.childrenNodes.includes(nodeId)) {
    return nodeId
  }
  let currentParent = getParentId(nodeId, data)
  while (currentParent) {
    const parentCluster = tree.get(currentParent)
    if (!parentCluster) {
      break
    }
    if (parentCluster.parent === clusterId) {
      return currentParent
    }
    currentParent = parentCluster.parent
  }
  return undefined
}

function ensureChildClusterLayouts(
  cluster: Cluster,
  inheritedDirection: DagreOptions['direction'],
  data: GraphData,
  options: DagreOptions,
  tree: ClusterTree,
  layouts: ClusterLayouts,
): void {
  for (const child of cluster.childrenClusters) {
    if (!layouts.has(child)) {
      layoutClusterRecursive(child, inheritedDirection, data, options, tree, layouts)
    }
  }
}

function createConfiguredClusterGraph(
  direction: DagreOptions['direction'],
  options: DagreOptions,
): dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes> {
  const spacing = typeof options.spacing === 'number' ? options.spacing : DEFAULT_SPACING
  const nodesep = typeof options.nodeSpacing === 'number' ? options.nodeSpacing : spacing
  const ranksep = typeof options.rankSpacing === 'number' ? options.rankSpacing : spacing
  const graph = new dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>({
    multigraph: true,
    compound: false,
  })
  graph.setGraph({
    rankdir: rankdirFor(direction),
    align: 'UL',
    nodesep,
    ranksep,
    edgesep: Math.max(MIN_EDGE_SEPARATION, Math.min(MAX_EDGE_SEPARATION, spacing / 3)),
    ranker: 'tight-tree',
  })
  graph.setDefaultEdgeLabel(() => ({}))
  return graph
}

function addClusterMembersToGraph(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
  cluster: Cluster,
  data: GraphData,
  layouts: ClusterLayouts,
): void {
  for (const nodeId of cluster.childrenNodes) {
    const node = data.nodes.find((candidate) => candidate.id === nodeId)
    if (!node) {
      continue
    }
    const dimensions = getNodeDimensions(node)
    graph.setNode(nodeId, { width: dimensions.width, height: dimensions.height })
  }
  for (const childClusterId of cluster.childrenClusters) {
    const layout = layouts.get(childClusterId)
    const size = layout?.size ?? { width: CLUSTER_MIN_WIDTH, height: CLUSTER_MIN_HEIGHT }
    graph.setNode(childClusterId, { width: size.width, height: size.height })
  }
}

function connectClusterEdges(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
  clusterId: string,
  data: GraphData,
  tree: ClusterTree,
  leaves: Set<string>,
): void {
  for (const [index, edge] of data.edges.entries()) {
    if (!leaves.has(edge.from) || !leaves.has(edge.to)) {
      continue
    }
    const mappedFrom = mapNodeToImmediateAncestor(edge.from, clusterId, tree, data)
    const mappedTo = mapNodeToImmediateAncestor(edge.to, clusterId, tree, data)
    if (!mappedFrom || !mappedTo) {
      continue
    }
    const weight = typeof edge.label === 'string' && /\byes\b/i.test(edge.label) ? 3 : 1
    graph.setEdge(mappedFrom, mappedTo, { weight }, `c${clusterId}:${String(index)}`)
  }
}

function buildClusterLayoutFromGraph(
  graph: dagre.graphlib.Graph<DagreNodeAttributes, DagreEdgeAttributes>,
): ClusterLayoutInfo {
  dagre.layout(graph)
  const positions = new Map<string, PositionedNode>()
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const id of graph.nodes()) {
    const nodeBox = graph.node(id)
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
    positions.set(id, { id, x, y, width: nodeBox.width, height: nodeBox.height })
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + nodeBox.width)
    maxY = Math.max(maxY, y + nodeBox.height)
  }
  const hasNodes = positions.size > 0 && Number.isFinite(minX) && Number.isFinite(minY)
  const width = hasNodes ? maxX - minX + CLUSTER_PADDING * 2 : CLUSTER_MIN_WIDTH
  const height = hasNodes
    ? maxY - minY + CLUSTER_PADDING * 2 + CLUSTER_LABEL_PADDING
    : CLUSTER_MIN_HEIGHT
  return {
    size: {
      width: Math.max(CLUSTER_MIN_WIDTH, width),
      height: Math.max(CLUSTER_MIN_HEIGHT, height),
    },
    positions,
  }
}

function determineClusterDirection(
  clusterId: string,
  inheritedDirection: DagreOptions['direction'],
  data: GraphData,
  tree: ClusterTree,
): { direction: DagreOptions['direction']; leaves: Set<string> } {
  const leaves = descendantLeaves(clusterId, tree)
  const hasExternalEdge = data.edges.some((edge) => {
    const fromInside = leaves.has(edge.from)
    const toInside = leaves.has(edge.to)
    return (fromInside && !toInside) || (!fromInside && toInside)
  })
  const direction = hasExternalEdge
    ? inheritedDirection
    : clusterDirection(clusterId, data, inheritedDirection)
  return { direction, leaves }
}

function layoutClusterRecursive(
  clusterId: string,
  inheritedDirection: DagreOptions['direction'],
  data: GraphData,
  options: DagreOptions,
  tree: ClusterTree,
  layouts: ClusterLayouts,
): void {
  if (layouts.has(clusterId)) {
    return
  }
  const cluster = tree.get(clusterId)
  if (!cluster) {
    return
  }
  ensureChildClusterLayouts(cluster, inheritedDirection, data, options, tree, layouts)
  const { direction, leaves } = determineClusterDirection(clusterId, inheritedDirection, data, tree)
  const graph = createConfiguredClusterGraph(direction, options)
  addClusterMembersToGraph(graph, cluster, data, layouts)
  connectClusterEdges(graph, clusterId, data, tree, leaves)
  const layoutInfo = buildClusterLayoutFromGraph(graph)
  layouts.set(clusterId, layoutInfo)
}

function computeSide(
  parentId: string,
  childId: string,
  layouts: ClusterLayouts,
): EdgeHintSide | undefined {
  const layout = layouts.get(parentId)
  if (!layout) {
    return undefined
  }
  const positioned = layout.positions.get(childId)
  if (!positioned) {
    return undefined
  }
  const box = boundingBox(layout.positions.values())
  const centerX = positioned.x + positioned.width / 2
  const centerY = positioned.y + positioned.height / 2
  const distances: [EdgeHintSide, number][] = [
    ['W', centerX - box.minX],
    ['E', box.maxX - centerX],
    ['N', centerY - box.minY],
    ['S', box.maxY - centerY],
  ]
  let closest: [EdgeHintSide, number] | undefined
  for (const entry of distances) {
    if (!closest || entry[1] < closest[1]) {
      closest = entry
    }
  }
  return closest?.[0]
}

function clusterDirection(
  clusterId: string,
  data: GraphData,
  inherit: DagreOptions['direction'],
): DagreOptions['direction'] {
  const container = data.nodes.find((node) => node.id === clusterId)
  const declared = (
    container?.metadata as { subgraphDirection?: DagreOptions['direction'] } | undefined
  )?.subgraphDirection
  return declared ?? inherit
}

function rankdirFor(direction: DagreOptions['direction'] | undefined): RankDirection {
  return rankdir(direction ?? 'RIGHT')
}

function buildImmediateParentMap(data: GraphData): Map<string, string | undefined> {
  const map = new Map<string, string | undefined>()
  for (const node of data.nodes) {
    const metadata = node.metadata as { parent?: string } | undefined
    map.set(node.id, typeof metadata?.parent === 'string' ? metadata.parent : undefined)
  }
  return map
}

function groupDirectClusterEdges(
  data: GraphData,
  parentByNode: Map<string, string | undefined>,
): ClusterEdgeMap {
  const grouped = new Map<string, EdgeData[]>()
  for (const edge of data.edges) {
    const fromParent = parentByNode.get(edge.from)
    const toParent = parentByNode.get(edge.to)
    if (!fromParent || fromParent !== toParent) {
      continue
    }
    const bucket = grouped.get(fromParent)
    if (bucket) {
      bucket.push(edge)
    } else {
      grouped.set(fromParent, [edge])
    }
  }
  return grouped
}

function toRecord<T>(entries: Iterable<[string, T]>): Record<string, T> {
  return Object.fromEntries(entries)
}

function collectTopLevelLooseNodes(data: GraphData): GraphData['nodes'] {
  return data.nodes.filter((node) => {
    const metadata = node.metadata as { parent?: string; isSubgraph?: boolean } | undefined
    return !metadata?.parent && !metadata?.isSubgraph
  })
}

function buildOuterNodes(
  roots: string[],
  clusterLayouts: ClusterLayouts,
  looseNodes: GraphData['nodes'],
): { id: string; width: number; height: number }[] {
  const clusterNodes = roots.map((id) => {
    const layout = clusterLayouts.get(id)
    const size = layout?.size ?? { width: CLUSTER_MIN_WIDTH, height: CLUSTER_MIN_HEIGHT }
    return { id, width: size.width, height: size.height }
  })
  const loose = looseNodes.map((node) => {
    const dimensions = getNodeDimensions(node)
    return { id: node.id, width: dimensions.width, height: dimensions.height }
  })
  return [...clusterNodes, ...loose]
}

function rootOfNode(nodeId: string, data: GraphData, tree: ClusterTree): string | undefined {
  let parent = getParentId(nodeId, data)
  let topParent: string | undefined
  while (parent) {
    topParent = parent
    parent = tree.get(parent)?.parent
  }
  return topParent
}

function buildOuterEdges(
  data: GraphData,
  tree: ClusterTree,
  layouts: ClusterLayouts,
): { edges: OuterEdgeInfo[]; hints: Map<number, { from?: EdgeHintSide; to?: EdgeHintSide }> } {
  const edges: OuterEdgeInfo[] = []
  const hints = new Map<number, { from?: EdgeHintSide; to?: EdgeHintSide }>()
  for (const [index, edge] of data.edges.entries()) {
    const fromRoot = rootOfNode(edge.from, data, tree)
    const toRoot = rootOfNode(edge.to, data, tree)
    if (fromRoot && toRoot && fromRoot === toRoot) {
      continue
    }
    const outerFrom = fromRoot ?? edge.from
    const outerTo = toRoot ?? edge.to
    edges.push({ from: outerFrom, to: outerTo, sourceIndex: index })
    const hint: { from?: EdgeHintSide; to?: EdgeHintSide } = {}
    if (fromRoot) {
      hint.from = computeSide(fromRoot, edge.from, layouts)
    }
    if (toRoot) {
      hint.to = computeSide(toRoot, edge.to, layouts)
    }
    hints.set(index, hint)
  }
  return { edges, hints }
}

function buildOuterGraph(
  data: GraphData,
  outerNodes: { id: string; width: number; height: number }[],
  outerEdges: OuterEdgeInfo[],
): GraphData {
  return {
    nodes: outerNodes.map((node) => ({
      id: node.id,
      label: node.id,
      type: isSubgraphNode(node.id, data)
        ? 'Composite'
        : (data.nodes.find((candidate) => candidate.id === node.id)?.type ?? 'MermaidNode'),
      metadata: { width: node.width, height: node.height },
    })),
    edges: outerEdges.map((edge) => ({ from: edge.from, to: edge.to })),
  }
}

function placeLooseNodes(
  looseNodes: GraphData['nodes'],
  outerPositions: Map<string, PositionedNode>,
  finalNodes: Map<string, PositionedNode>,
): void {
  for (const node of looseNodes) {
    const position = outerPositions.get(node.id)
    if (!position) {
      continue
    }
    finalNodes.set(node.id, { ...position, id: node.id })
  }
}

function placeImmediateChildNodes(
  cluster: Cluster,
  layout: ClusterLayoutInfo,
  offsetX: number,
  offsetY: number,
  finalNodes: Map<string, PositionedNode>,
): void {
  for (const nodeId of cluster.childrenNodes) {
    const local = layout.positions.get(nodeId)
    if (!local) {
      continue
    }
    finalNodes.set(nodeId, {
      id: nodeId,
      x: local.x + offsetX,
      y: local.y + offsetY,
      width: local.width,
      height: local.height,
    })
  }
}

function emitDirectEdges(
  clusterId: string,
  layout: ClusterLayoutInfo,
  offsetX: number,
  offsetY: number,
  directEdges: ClusterEdgeMap,
  finalEdges: PositionedEdge[],
): void {
  const edges = directEdges.get(clusterId) ?? []
  for (const edge of edges) {
    const sourceLocal = layout.positions.get(edge.from)
    const targetLocal = layout.positions.get(edge.to)
    if (!sourceLocal || !targetLocal) {
      continue
    }
    finalEdges.push({
      startPoint: {
        x: sourceLocal.x + offsetX + sourceLocal.width / 2,
        y: sourceLocal.y + offsetY + sourceLocal.height / 2,
      },
      endPoint: {
        x: targetLocal.x + offsetX + targetLocal.width / 2,
        y: targetLocal.y + offsetY + targetLocal.height / 2,
      },
    })
  }
}

function placeChildClusters(
  cluster: Cluster,
  layout: ClusterLayoutInfo,
  offsetX: number,
  offsetY: number,
  context: ExpansionContext,
): void {
  for (const childClusterId of cluster.childrenClusters) {
    const localProxy = layout.positions.get(childClusterId)
    if (!localProxy) {
      continue
    }
    const absoluteProxy: PositionedNode = {
      id: childClusterId,
      x: localProxy.x + offsetX,
      y: localProxy.y + offsetY,
      width: localProxy.width,
      height: localProxy.height,
    }
    context.finalNodes.set(absoluteProxy.id, absoluteProxy)
    expandClusterTree(childClusterId, absoluteProxy, context)
  }
}

function expandClusterTree(
  clusterId: string,
  proxy: PositionedNode,
  context: ExpansionContext,
): void {
  context.finalNodes.set(clusterId, { ...proxy, id: clusterId })
  const cluster = context.tree.get(clusterId)
  const layout = context.layouts.get(clusterId)
  if (!cluster || !layout) {
    return
  }
  const offsetX = proxy.x + CLUSTER_PADDING
  const offsetY = proxy.y + CLUSTER_PADDING
  placeImmediateChildNodes(cluster, layout, offsetX, offsetY, context.finalNodes)
  emitDirectEdges(clusterId, layout, offsetX, offsetY, context.directEdges, context.finalEdges)
  placeChildClusters(cluster, layout, offsetX, offsetY, context)
}

function applyOuterEdges(
  outerLayout: LayoutResult,
  outerEdges: OuterEdgeInfo[],
  edgeHints: Map<number, { from?: EdgeHintSide; to?: EdgeHintSide }>,
  finalEdges: PositionedEdge[],
): void {
  const positionedIterator = outerLayout.edges[Symbol.iterator]()
  for (const meta of outerEdges) {
    const nextPosition = positionedIterator.next()
    if (nextPosition.done) {
      break
    }
    const positioned = nextPosition.value
    const hint = edgeHints.get(meta.sourceIndex)
    const hintSides = hint ? { start: hint.from, end: hint.to } : undefined
    finalEdges.push({
      startPoint: positioned.startPoint,
      endPoint: positioned.endPoint,
      bendPoints: positioned.bendPoints,
      hintSides,
    })
  }
}

export function layoutGraphDagre(
  data: GraphData,
  options: DagreOptions = {},
): Promise<LayoutResult> {
  if (!hasSubgraphs(data)) {
    return Promise.resolve(baseLayoutGraphDagre(data, options))
  }

  const tree = buildClusterTree(data)
  const layouts: ClusterLayouts = new Map()
  const parentByNode = buildImmediateParentMap(data)
  const directEdges = groupDirectClusterEdges(data, parentByNode)

  const roots = [...tree.values()].filter((cluster) => !cluster.parent).map((cluster) => cluster.id)
  const inheritedDirection = options.direction ?? 'RIGHT'
  for (const root of roots) {
    layoutClusterRecursive(root, inheritedDirection, data, options, tree, layouts)
  }

  const looseNodes = collectTopLevelLooseNodes(data)
  const outerNodes = buildOuterNodes(roots, layouts, looseNodes)
  const { edges: outerEdges, hints } = buildOuterEdges(data, tree, layouts)
  const outerGraph = buildOuterGraph(data, outerNodes, outerEdges)
  const outerLayout = baseLayoutGraphDagre(outerGraph, options)
  const outerPositions = new Map(Object.entries(outerLayout.nodes))

  const finalNodes = new Map<string, PositionedNode>()
  const finalEdges: PositionedEdge[] = []
  placeLooseNodes(looseNodes, outerPositions, finalNodes)

  const context: ExpansionContext = {
    tree,
    layouts,
    directEdges,
    finalNodes,
    finalEdges,
  }

  for (const root of roots) {
    const proxy = outerPositions.get(root)
    if (!proxy) {
      continue
    }
    expandClusterTree(root, proxy, context)
  }

  applyOuterEdges(outerLayout, outerEdges, hints, finalEdges)

  return Promise.resolve({ nodes: toRecord(finalNodes), edges: finalEdges })
}
