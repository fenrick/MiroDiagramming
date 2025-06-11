import { RoutedEdge } from './layoutEngine';
import { WidgetMap } from './shapeRenderer';
import { attachConnectorMetadata } from './metadata';
import { DeepPartial, ConnectorCaption } from '@mirohq/websdk-types';

/**
 * Draw connectors between widgets using the layout information.
 */
export async function renderEdges(
  edges: RoutedEdge[],
  widgets: WidgetMap
): Promise<unknown[]> {
  const connectors: unknown[] = [];
  for (const edge of edges) {
    const start = widgets[edge.source];
    const end = widgets[edge.target];
    if (!start || !end) continue;
    const connector = await miro.board.createConnector({
      start: { item: start.id },
      end: { item: end.id },
      captions: edge.label
        ? [{ position: 0.5, text: edge.label } as DeepPartial<ConnectorCaption>]
        : undefined,
    });
    attachConnectorMetadata(connector, {
      type: 'edge',
      edgeId: edge.id,
      source: edge.source,
      target: edge.target,
    });
    connectors.push(connector);
  }
  return connectors;
}
