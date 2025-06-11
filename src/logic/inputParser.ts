/** Node description used in GraphInput. */
export interface GraphNode {
  /** Unique identifier of the node. */
  id: string;
  /** Optional text label shown on the node. */
  label?: string;
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
 * Validate and parse user provided JSON into a typed {@link GraphInput}.
 *
 * @param json - Raw data describing nodes and edges.
 * @returns Parsed graph structure.
 * @throws If the input does not contain valid `nodes` and `edges` arrays.
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
  nodes.forEach((n) => {
    if (typeof (n as any).id !== 'string') {
      throw new Error('Node id must be a string');
    }
  });
  edges.forEach((e) => {
    if (
      typeof (e as any).source !== 'string' ||
      typeof (e as any).target !== 'string'
    ) {
      throw new Error('Edges must have source and target');
    }
  });
  return { nodes: nodes as GraphNode[], edges: edges as GraphEdge[] };
}
