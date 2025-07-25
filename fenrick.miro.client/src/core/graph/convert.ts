import { HierNode } from '../layout/nested-layout';
import { EdgeData, GraphData, NodeData } from './graph-service';

/**
 * Transform a flat edge list into a nested hierarchy structure.
 *
 * @param graph - The graph data containing nodes and edges.
 * @returns An array of root hierarchy nodes with nested children.
 */
export function edgesToHierarchy(graph: GraphData): HierNode[] {
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  const children: Record<string, string[]> = {};
  const childSet = new Set<string>();
  for (const edge of graph.edges) {
    children[edge.from] ?? = [];
    children[edge.from].push(edge.to);
    childSet.add(edge.to);
  }
  const build = (id: string): HierNode => {
    const n = nodeMap.get(id) as NodeData;
    const kids = children[id]?.map(build);
    return {
      id: n.id,
      label: n.label,
      type: n.type,
      metadata: n.metadata,
      ...(kids?.length ? { children: kids } : {}),
    } as HierNode;
  };
  const roots = graph.nodes
    .filter(n => !childSet.has(n.id))
    .map(n => build(n.id));
  return roots;
}

/**
 * Flatten a hierarchy into a graph representation with explicit edges.
 *
 * @param roots - Top level hierarchy nodes to flatten.
 * @returns The equivalent flat graph data.
 */
export function hierarchyToEdges(roots: HierNode[]): GraphData {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  const visit = (node: HierNode): void => {
    nodes.push({
      id: node.id,
      label: node.label,
      type: node.type,
      metadata: node.metadata,
    });
    for (const child of node.children ?? []) {
      edges.push({ from: node.id, to: child.id });
      visit(child);
    }
  };
  for (const root of roots) {
    visit(root);
  }
  return { nodes, edges };
}
