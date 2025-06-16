export interface PositionedNode {
  id: string;
  widget: { id: string };
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
  label?: string;
}

export interface Graph {
  id: string;
  nodes: PositionedNode[];
  edges: GraphEdge[];
}

/**
 * Draw connectors between positioned nodes on the board.
 *
 * @param graph - Graph containing edges to create.
 * @param nodeMap - Map of node ids to widget instances returned from createNodes.
 * @returns Array of created connector widgets.
 */
export async function createEdges(
  graph: Graph,
  nodeMap: Record<string, { id: string }>
): Promise<import('@mirohq/websdk-types').Connector[]> {
  const connectors: import('@mirohq/websdk-types').Connector[] = [];
  for (const edge of graph.edges) {
    const fromWidget = nodeMap[edge.from];
    const toWidget = nodeMap[edge.to];
    if (!fromWidget || !toWidget) continue;
    const connector = await miro.board.createConnector({
      start: { item: fromWidget.id },
      end: { item: toWidget.id },
      style: edge.label ? { text: edge.label } : undefined,
    });
    connector.setMetadata('app.miro.structgraph', {
      graphId: graph.id,
      from: edge.from,
      to: edge.to,
    });
    await connector.sync();
    connectors.push(connector);
  }
  return connectors;
}
