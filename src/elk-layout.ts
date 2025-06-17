import ELK from 'elkjs/lib/elk.bundled.js';
import { GraphData } from './graph';
import { getTemplate } from './templates';

/**
 * Node with layout coordinates returned from ELK.
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Edge segment coordinates as returned by ELK.
 */
export interface PositionedEdge {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  bendPoints?: { x: number; y: number }[];
}

// Fallback dimensions for nodes when templates omit width or height
const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 110;

/**
 * Grouped layout results for nodes and edges.
 */
export interface LayoutResult {
  nodes: Record<string, PositionedNode>;
  edges: PositionedEdge[];
}

/**
 * Run the ELK layout engine on the provided graph data and
 * return positioned nodes and edges.
 */
export const layoutGraph = async (
  data: GraphData
): Promise<LayoutResult> => {
  const elk = new ELK();
  const elkGraph: any = {
    id: 'root',
    layoutOptions: {
      // Basic layered layout configuration
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.algorithm': 'mrtree',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.mergeEdges': 'false',
      'elk.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.spacing.nodeNode': 90,
      'elk.layered.unnecessaryBendpoints': 'true',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
    },
    // Each node uses its template dimensions unless overridden by metadata
    children: data.nodes.map((n) => {
      const tpl = getTemplate(n.type);
      const dims = tpl?.elements.find((e) => e.width && e.height);
      const width = (n as any).metadata?.width ?? dims?.width ?? DEFAULT_WIDTH;
      const height =
        (n as any).metadata?.height ?? dims?.height ?? DEFAULT_HEIGHT;
      return { id: n.id, width, height };
    }),
    edges: data.edges.map((e, idx) => ({
      id: `e${idx}`,
      sources: [e.from],
      targets: [e.to],
    })),
  };

  const layouted: any = await elk.layout(elkGraph);
  const nodes: Record<string, PositionedNode> = {};
  const edges: PositionedEdge[] = [];
  // Convert ELK child nodes to a lookup table by id
  for (const child of layouted.children || []) {
    nodes[child.id] = {
      id: child.id,
      x: child.x || 0,
      y: child.y || 0,
      width: child.width || DEFAULT_WIDTH,
      height: child.height || DEFAULT_HEIGHT,
    };
  }
  // Capture the first section of each edge for connector placement hints
  for (const edge of layouted.edges || []) {
    const section = edge.sections?.[0];
    if (!section) continue;
    edges.push({
      startPoint: section.startPoint,
      endPoint: section.endPoint,
      bendPoints: section.bendPoints,
    });
  }
  return { nodes, edges };
};
