export interface GraphNode {
  id: string;
  label?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Validate and parse user provided JSON into a GraphInput structure.
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
