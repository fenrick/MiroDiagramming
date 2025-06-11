import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { GraphInput, GraphNode, GraphEdge } from './inputParser';

/** Graph node with calculated position and size. */
export interface PositionedNode extends GraphNode {
  /** Horizontal coordinate of the node center. */
  x: number;
  /** Vertical coordinate of the node center. */
  y: number;
  /** Width assigned by the layout engine. */
  width: number;
  /** Height assigned by the layout engine. */
  height: number;
}

/** Graph edge including optional routing instructions. */
export interface RoutedEdge extends GraphEdge {
  /** Sections representing connector polyline calculated by ELK. */
  sections?: {
    /** Start coordinate of the connector section. */
    startPoint: { x: number; y: number };
    /** End coordinate of the connector section. */
    endPoint: { x: number; y: number };
    /** Optional intermediate bend points. */
    bendPoints?: { x: number; y: number }[];
  }[];
}

/**
 * Run the ELK layout algorithm for fixed-size nodes and return positioned
 * nodes and routed edges.
 *
 * @param graph - Parsed graph structure to be laid out.
 * @returns Promise resolving to arrays of positioned nodes and routed edges.
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
