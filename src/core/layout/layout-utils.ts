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
  return { x: (pt.x - node.x) / node.width, y: (pt.y - node.y) / node.height };
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

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Determine the bounding box of nodes positioned using their top-left corner.
 *
 * @param nodes - Mapping of node ids to absolute top-left coordinates.
 * @returns The bounding box enclosing all nodes.
 */
export function boundingBoxFromTopLeft(
  nodes: Record<string, NodePosition>,
): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  Object.values(nodes).forEach(({ x, y, width, height }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  return { minX, minY, maxX, maxY };
}

/**
 * Determine the bounding box of nodes positioned using their centre point.
 *
 * @param nodes - Mapping of node ids to absolute centre coordinates.
 * @returns The bounding box enclosing all nodes.
 */
export function boundingBoxFromCenter(
  nodes: Record<string, NodePosition>,
): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  Object.values(nodes).forEach(({ x, y, width, height }) => {
    const halfW = width / 2;
    const halfH = height / 2;
    minX = Math.min(minX, x - halfW);
    minY = Math.min(minY, y - halfH);
    maxX = Math.max(maxX, x + halfW);
    maxY = Math.max(maxY, y + halfH);
  });
  return { minX, minY, maxX, maxY };
}

/**
 * @deprecated Use {@link boundingBoxFromTopLeft} or {@link boundingBoxFromCenter}.
 * Determines the bounding box of positioned nodes.
 */
export function boundingBox(
  nodes: Record<string, NodePosition>,
  centerBased = false,
): BoundingBox {
  return centerBased
    ? boundingBoxFromCenter(nodes)
    : boundingBoxFromTopLeft(nodes);
}

/**
 * Calculate offsets for placing nodes within a frame at a given spot.
 *
 * @param spot - Location of the frame centre.
 * @param frameWidth - Total frame width including margin.
 * @param frameHeight - Total frame height including margin.
 * @param bounds - Bounding box of the nodes.
 * @param margin - Margin applied around the nodes.
 * @returns Offsets to apply to node coordinates.
 */
export function frameOffset(
  spot: { x: number; y: number },
  frameWidth: number,
  frameHeight: number,
  bounds: { minX: number; minY: number },
  margin: number,
): { offsetX: number; offsetY: number } {
  return {
    offsetX: spot.x - frameWidth / 2 + margin - bounds.minX,
    offsetY: spot.y - frameHeight / 2 + margin - bounds.minY,
  };
}
