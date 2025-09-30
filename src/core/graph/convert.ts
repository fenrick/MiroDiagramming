import { type HierNode } from '../layout/nested-layout'

import { type EdgeData, type GraphData, type NodeData } from './graph-service'

/**
 * Transform a flat edge list into a nested hierarchy structure.
 *
 * @param graph - The graph data containing nodes and edges.
 * @returns An array of root hierarchy nodes with nested children.
 */
export function edgesToHierarchy(graph: GraphData): HierNode[] {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const children = new Map<string, string[]>()
  const childSet = new Set<string>()
  for (const edge of graph.edges) {
    let list = children.get(edge.from)
    if (!list) {
      list = []
      children.set(edge.from, list)
    }
    list.push(edge.to)
    childSet.add(edge.to)
  }
  const build = (id: string): HierNode => {
    const node = nodeMap.get(id)
    if (!node) {
      throw new Error(`Missing node for id ${id}`)
    }
    const kids = (children.get(id) ?? []).map((childId) => build(childId))
    const result: HierNode = {
      id: node.id,
      label: node.label,
      type: node.type,
      metadata: node.metadata,
    }
    if (kids.length > 0) {
      result.children = kids
    }
    return result
  }
  const roots = graph.nodes.filter((n) => !childSet.has(n.id)).map((n) => build(n.id))
  return roots
}

/**
 * Flatten a hierarchy into a graph representation with explicit edges.
 *
 * @param roots - Top level hierarchy nodes to flatten.
 * @returns The equivalent flat graph data.
 */
export function hierarchyToEdges(roots: HierNode[]): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []
  const visit = (node: HierNode): void => {
    nodes.push({
      id: node.id,
      label: node.label,
      type: node.type,
      metadata: node.metadata,
    })
    for (const child of node.children ?? []) {
      edges.push({ from: node.id, to: child.id })
      visit(child)
    }
  }
  for (const root of roots) {
    visit(root)
  }
  return { nodes, edges }
}
