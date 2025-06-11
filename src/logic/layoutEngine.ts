import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { GraphInput, GraphNode, GraphEdge } from './inputParser';

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutedEdge extends GraphEdge {
  sections?: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    bendPoints?: { x: number; y: number }[];
  }[];
}

/**
 * Run ELK layout algorithm for fixed-size nodes.
 */
export async function runLayout(graph: GraphInput): Promise<{
  nodes: PositionedNode[];
  edges: RoutedEdge[];
}> {
  const elk = new ELK();
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: { 'elk.algorithm': 'layered' },
    children: graph.nodes.map((n) => ({ id: n.id, width: 150, height: 80 })),
    edges: graph.edges.map((e) => ({
      id: e.id || `${e.source}-${e.target}`,
      sources: [e.source],
      targets: [e.target],
    })),
  };
  const result = await elk.layout(elkGraph);
  const positionedNodes: PositionedNode[] = (result.children || []).map(
    (n: ElkNode) => ({
      id: n.id,
      label: graph.nodes.find((nd) => nd.id === n.id)?.label,
      type: graph.nodes.find((nd) => nd.id === n.id)?.type,
      x: n.x ?? 0,
      y: n.y ?? 0,
      width: n.width ?? 0,
      height: n.height ?? 0,
    })
  );
  const positionedEdges: RoutedEdge[] = (result.edges || []).map(
    (e: ElkExtendedEdge) => ({
      id: e.id,
      source: e.sources[0],
      target: e.targets[0],
      label: graph.edges.find(
        (ed) => (ed.id || `${ed.source}-${ed.target}`) === e.id
      )?.label,
      sections: e.sections,
    })
  );
  return { nodes: positionedNodes, edges: positionedEdges };
}
