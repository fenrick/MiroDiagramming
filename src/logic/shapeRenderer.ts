import { Shape } from '@mirohq/websdk-types';
import { PositionedNode } from './layoutEngine';
import { attachShapeMetadata } from './metadata';

/** Mapping from node id to the created shape widget. */
export interface WidgetMap {
  [nodeId: string]: Shape;
}

/**
 * Create rectangle widgets for all nodes and attach metadata.
 *
 * @param nodes - Nodes with layout information.
 * @returns Mapping of node ids to created widgets.
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
