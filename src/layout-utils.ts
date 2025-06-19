/**
 * Convert an absolute point into fractional coordinates relative to a node's
 * bounding box.
 *
 * @param node - The target node with absolute position and dimensions.
 * @param pt - The absolute point to convert.
 * @returns The fractional position of the point within the node.
 */
export function relativePosition(
  node: { x: number; y: number; width: number; height: number },
  pt: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (pt.x - node.x) / node.width,
    y: (pt.y - node.y) / node.height,
  };
}

export interface EdgeHint {
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
}

/**
 * Calculate edge hints describing where each edge connects to its source and
 * target nodes in relative coordinates.
 *
 * @param graph - Graph data containing edge definitions.
 * @param layout - Layout result with absolute node positions and edge points.
 * @returns A list of edge hints mapping each edge's start and end positions.
 */
export function computeEdgeHints(
  graph: { edges: Array<{ from: string; to: string }> },
  layout: {
    nodes: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >;
    edges: Array<{
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
    }>;
  },
): EdgeHint[] {
  return layout.edges.map((edge, i) => {
    const src = layout.nodes[graph.edges[i].from];
    const tgt = layout.nodes[graph.edges[i].to];
    return {
      startPosition: relativePosition(src, edge.startPoint),
      endPosition: relativePosition(tgt, edge.endPoint),
    };
  });
}
