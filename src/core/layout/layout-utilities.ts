/**
 * Convert an absolute point into fractional coordinates relative to a node's
 * bounding box.
 *
 * @param node - The target node with absolute position and dimensions.
 * @param pt - The absolute point to convert.
 * @returns The fractional position of the point within the node.
 */
const clampFraction = (value: number): number => Math.min(Math.max(value, 0), 1)

export function relativePosition(
  node: { x: number; y: number; width: number; height: number },
  pt: { x: number; y: number },
): { x: number; y: number } {
  const fx = (pt.x - node.x) / node.width
  const fy = (pt.y - node.y) / node.height
  return { x: clampFraction(fx), y: clampFraction(fy) }
}

export interface EdgeHint {
  startPosition?: { x: number; y: number }
  endPosition?: { x: number; y: number }
  /** Optional suggestion for connector shape based on path geometry. */
  shape?: ConnectorShape
}

type ConnectorShape = 'straight' | 'elbowed' | 'curved'
type CardinalDirection = 'N' | 'E' | 'S' | 'W'

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
      hintSides?: { start?: CardinalDirection; end?: CardinalDirection }
    }[]
  },
): EdgeHint[] {
  return layout.edges.map((edge, index) => {
    const info = graph.edges.at(index)
    if (!info) {
      return {}
    }

    const source = getNode(layout.nodes, info.from)
    const target = getNode(layout.nodes, info.to)

    const startHint = edge.hintSides?.start
    const endHint = edge.hintSides?.end

    const fractionalFrom = deriveFractionalPosition(startHint, source, edge.startPoint)
    const fractionalTo = deriveFractionalPosition(endHint, target, edge.endPoint)

    const shape =
      startHint && endHint
        ? preferredShapeForSides(startHint, endHint)
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
}): ConnectorShape {
  const points: { x: number; y: number }[] = [
    edge.startPoint,
    ...(edge.bendPoints ?? []),
    edge.endPoint,
  ]
  if (points.length <= 2) {
    return classifyStraightSegment(points)
  }
  const ratio = computeManhattanRatio(points)
  return ratio > 0.8 ? 'elbowed' : 'curved'
}

function sideToFraction(side: CardinalDirection): { x: number; y: number } {
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
    case 'W': {
      return { x: 0, y: 0.5 }
    }
  }
}

function preferredShapeForSides(from: CardinalDirection, to: CardinalDirection): ConnectorShape {
  return isOppositeSide(from, to) ? 'elbowed' : 'curved'
}

const isOppositeSide = (a: CardinalDirection, b: CardinalDirection): boolean =>
  (a === 'E' && b === 'W') ||
  (a === 'W' && b === 'E') ||
  (a === 'N' && b === 'S') ||
  (a === 'S' && b === 'N')

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

const getNode = <T>(nodes: Record<string, T>, id: string): T | undefined => {
  for (const [key, value] of Object.entries(nodes)) {
    if (key === id) {
      return value
    }
  }
  return undefined
}

const deriveFractionalPosition = (
  hint: CardinalDirection | undefined,
  node: { x: number; y: number; width: number; height: number } | undefined,
  point: { x: number; y: number },
): { x: number; y: number } | undefined => {
  if (hint) {
    return sideToFraction(hint)
  }
  if (node) {
    return relativePosition(node, point)
  }
  return undefined
}

const classifyStraightSegment = (points: { x: number; y: number }[]): ConnectorShape => {
  const [start, end] = points
  if (!end) {
    return 'straight'
  }
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  if (dx < 1 || dy < 1) {
    return 'straight'
  }
  return dx === 0 || dy === 0 ? 'straight' : 'curved'
}

const computeManhattanRatio = (points: { x: number; y: number }[]): number => {
  const tol = 0.01
  let manhattanSegments = 0
  let segments = 0
  let previous: { x: number; y: number } | undefined
  for (const current of points) {
    if (!previous) {
      previous = current
      continue
    }
    segments += 1
    if (isAxisAlignedSegment(previous, current, tol)) {
      manhattanSegments += 1
    }
    previous = current
  }
  return segments === 0 ? 0 : manhattanSegments / segments
}

const isAxisAlignedSegment = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  tolerance: number,
): boolean => {
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const length = Math.max(dx, dy)
  if (length === 0) {
    return false
  }
  return dx / length < tolerance || dy / length < tolerance
}
