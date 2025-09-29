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
  const fx = (pt.x - node.x) / node.width
  const fy = (pt.y - node.y) / node.height
  const clamp = (v: number) => (v < 0 ? 0 : Math.min(v, 1))
  return { x: clamp(fx), y: clamp(fy) }
}

export interface EdgeHint {
  startPosition?: { x: number; y: number }
  endPosition?: { x: number; y: number }
  /** Optional suggestion for connector shape based on path geometry. */
  shape?: 'straight' | 'elbowed' | 'curved'
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
  graph: { edges: { from: string; to: string }[] },
  layout: {
    nodes: Record<string, { x: number; y: number; width: number; height: number }>
    edges: {
      startPoint: { x: number; y: number }
      endPoint: { x: number; y: number }
      bendPoints?: { x: number; y: number }[]
      hintSides?: { start?: 'N' | 'E' | 'S' | 'W'; end?: 'N' | 'E' | 'S' | 'W' }
    }[]
  },
): EdgeHint[] {
  return layout.edges.map((edge, index) => {
    const info = graph.edges.at(index)
    if (!info) {
      return {}
    }
    const source = layout.nodes[info.from]
    const tgt = layout.nodes[info.to]
    const fractionalFrom = edge.hintSides?.start
      ? sideToFraction(edge.hintSides.start)
      : source
        ? relativePosition(source, edge.startPoint)
        : undefined
    const fractionalTo = edge.hintSides?.end
      ? sideToFraction(edge.hintSides.end)
      : tgt
        ? relativePosition(tgt, edge.endPoint)
        : undefined
    const shape =
      edge.hintSides?.start && edge.hintSides.end
        ? preferredShapeForSides(edge.hintSides.start, edge.hintSides.end)
        : suggestConnectorShape(edge)
    return {
      startPosition: fractionalFrom,
      endPosition: fractionalTo,
      shape,
    }
  })
}

/** Determine whether a polyline is primarily Manhattan (axis-aligned) or not. */
function suggestConnectorShape(edge: {
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
  bendPoints?: { x: number; y: number }[]
}): 'elbowed' | 'curved' | 'straight' {
  const points = [edge.startPoint, ...(edge.bendPoints ?? []), edge.endPoint]
  if (points.length <= 2) {
    // With no bends, prefer straight if the delta strongly favors one axis.
    const dx = Math.abs(points[1]!.x - points[0]!.x)
    const dy = Math.abs(points[1]!.y - points[0]!.y)
    if (dx < 1 || dy < 1) return 'straight'
    return dx === 0 || dy === 0 ? 'straight' : 'curved'
  }
  // Tolerance for near-axis alignment
  const tol = 0.01
  let manhattanSegments = 0
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index]!
    const b = points[index + 1]!
    const dx = Math.abs(b.x - a.x)
    const dy = Math.abs(b.y - a.y)
    const length = Math.max(dx, dy)
    if (length === 0) continue
    const isAxisAligned = dx / length < tol || dy / length < tol
    if (isAxisAligned) manhattanSegments += 1
  }
  const ratio = manhattanSegments / (points.length - 1)
  return ratio > 0.8 ? 'elbowed' : 'curved'
}

function sideToFraction(side: 'N' | 'E' | 'S' | 'W'): { x: number; y: number } {
  switch (side) {
    case 'N': {
      return { x: 0.5, y: 0 }
    }
    case 'S': {
      return { x: 0.5, y: 1 }
    }
    case 'E': {
      return { x: 1, y: 0.5 }
    }
    case 'W':
    default: {
      return { x: 0, y: 0.5 }
    }
  }
}

function preferredShapeForSides(
  from: 'N' | 'E' | 'S' | 'W',
  to: 'N' | 'E' | 'S' | 'W',
): 'elbowed' | 'curved' | 'straight' {
  const opposite = (a: string, b: string) =>
    (a === 'E' && b === 'W') ||
    (a === 'W' && b === 'E') ||
    (a === 'N' && b === 'S') ||
    (a === 'S' && b === 'N')
  return opposite(from, to) ? 'elbowed' : 'curved'
}

export interface NodePosition {
  x: number
  y: number
  width: number
  height: number
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Determine the bounding box of nodes positioned using their top-left corner.
 *
 * @param nodes - Mapping of node ids to absolute top-left coordinates.
 * @returns The bounding box enclosing all nodes.
 */
export function boundingBoxFromTopLeft(nodes: Record<string, NodePosition>): BoundingBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { x, y, width, height } of Object.values(nodes)) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  }
  return { minX, minY, maxX, maxY }
}

/**
 * Determine the bounding box of nodes positioned using their centre point.
 *
 * @param nodes - Mapping of node ids to absolute centre coordinates.
 * @returns The bounding box enclosing all nodes.
 */
export function boundingBoxFromCenter(nodes: Record<string, NodePosition>): BoundingBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { x, y, width, height } of Object.values(nodes)) {
    const halfW = width / 2
    const halfH = height / 2
    minX = Math.min(minX, x - halfW)
    minY = Math.min(minY, y - halfH)
    maxX = Math.max(maxX, x + halfW)
    maxY = Math.max(maxY, y + halfH)
  }
  return { minX, minY, maxX, maxY }
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
  }
}
