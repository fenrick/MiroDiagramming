/** Node description used in GraphInput. */
export interface GraphNode {
  /** Unique identifier of the node. */
  id: string;
  /** Optional text label shown on the node. */
  label?: string;
  type?: string;
}

/** Edge connecting two nodes in the graph. */
export interface GraphEdge {
  /** Unique identifier of the edge. */
  id: string;
  /** Identifier of the source node. */
  source: string;
  /** Identifier of the target node. */
  target: string;
  /** Optional caption displayed on the connector. */
  label?: string;
}

/** Container describing a complete graph. */
export interface GraphInput {
  /** List of all nodes in the graph. */
  nodes: GraphNode[];
  /** List of all edges in the graph. */
  edges: GraphEdge[];
}

/**
 * Validate an array of raw nodes and return typed {@link GraphNode} objects.
 *
 * @param nodes - Unknown values representing nodes.
 * @returns Validated nodes cast to {@link GraphNode[]}.
 * @throws If any node is missing a string `id` or has an invalid `type`.
 */
export function validateNodes(nodes: unknown[]): GraphNode[] {
  nodes.forEach((n) => {
    if (typeof (n as any).id !== 'string') {
      throw new Error('Node id must be a string');
    }
    if ((n as any).type !== undefined && typeof (n as any).type !== 'string') {
      throw new Error('Node type must be a string if provided');
    }
  });
  return nodes as GraphNode[];
}

/**
 * Validate an array of raw edges and return typed {@link GraphEdge} objects.
 *
 * @param edges - Unknown values representing edges.
 * @returns Validated edges cast to {@link GraphEdge[]}.
 * @throws If any edge lacks string `source` or `target` identifiers.
 */
export function validateEdges(edges: unknown[]): GraphEdge[] {
  edges.forEach((e) => {
    if (
      typeof (e as any).source !== 'string' ||
      typeof (e as any).target !== 'string'
    ) {
      throw new Error('Edges must have source and target');
    }
  });
  return edges as GraphEdge[];
}

/**
 * Validate and parse user provided JSON into a typed {@link GraphInput}.
 *
 * @param json - Raw data describing nodes and edges.
 * @returns Parsed graph structure.
 * @throws If the input does not contain valid `nodes` and `edges` arrays or if
 * edges reference unknown node ids.
 */
export function parseGraph(json: any): GraphInput {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Input must be an object');
  }
  const data = json as Record<string, unknown>;
  const nodes = data.nodes;
  const edges = data.edges;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    throw new Error('Input must contain nodes[] and edges[]');
  }

  const parsedNodes = validateNodes(nodes);
  const parsedEdges = validateEdges(edges);

  const idSet = new Set(parsedNodes.map((n) => n.id));
  parsedEdges.forEach((e) => {
    if (!idSet.has(e.source) || !idSet.has(e.target)) {
      throw new Error('Edges must reference existing node ids');
    }
  });

  return {
    nodes: parsedNodes,
    edges: parsedEdges,
  };
}
