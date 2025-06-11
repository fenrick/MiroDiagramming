import { Shape } from '@mirohq/websdk-types';
import { PositionedNode } from './layoutEngine';
import { attachShapeMetadata } from './metadata';

export interface WidgetMap {
  [nodeId: string]: Shape;
}

/**
 * Draw widgets for each node and return a mapping from node id to widget.
 */
export async function renderNodes(nodes: PositionedNode[]): Promise<WidgetMap> {
  const map: WidgetMap = {};
  for (const node of nodes) {
    const widget = await miro.board.createShape({
      shape: 'rectangle',
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      content: node.label || '',
    });
    attachShapeMetadata(widget, { type: 'node', nodeId: node.id });
    map[node.id] = widget;
  }
  return map;
}
