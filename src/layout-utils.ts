/**
 * Calculate the position of a point relative to a node rectangle.
 *
 * @param node - The node rectangle with absolute coordinates and size.
 * @param pt - The absolute point to convert.
 * @returns Normalized coordinates where `(0,0)` is the top-left of the node and
 * `(1,1)` is the bottom-right.
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
 * Derive layout hints for edges using a processed ELK layout.
 *
 * Each hint contains the relative start and end positions of the connector so
 * that links can be recreated consistently on undo.
 *
 * @param graph - Source graph describing edge connections.
 * @param layout - Absolute coordinates computed by the layout engine.
 * @returns Array of relative start/end positions per edge.
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
