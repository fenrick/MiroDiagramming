import { RoutedEdge } from './layoutEngine';
import { WidgetMap } from './shapeRenderer';
import { attachMetadata } from './metadata';

/**
 * Draw connectors between widgets using the layout information.
 */
export async function renderEdges(
  edges: RoutedEdge[],
  widgets: WidgetMap
): Promise<any[]> {
  const connectors: any[] = [];
  for (const edge of edges) {
    const start = widgets[edge.source];
    const end = widgets[edge.target];
    if (!start || !end) continue;
    const connector = await miro.board.createConnector({
      startWidgetId: start.id,
      endWidgetId: end.id,
      captions: edge.label ? [{ position: 0.5, text: edge.label }] : undefined,
    });
    attachMetadata(connector, {
      type: 'edge',
      edgeId: edge.id,
      source: edge.source,
      target: edge.target,
    });
    connectors.push(connector);
  }
  return connectors;
}
