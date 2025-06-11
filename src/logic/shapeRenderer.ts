import { Shape, ShapeType } from '@mirohq/websdk-types';
import { PositionedNode } from './layoutEngine';
import { attachShapeMetadata } from './metadata';
import shapeTemplates from '../../templates/shapeTemplates.json';

interface ShapeTemplate {
  shape: ShapeType;
  fillColor?: string;
  color?: string;
  width?: number;
  height?: number;
}

const templates: Record<string, ShapeTemplate> = shapeTemplates as Record<
  string,
  ShapeTemplate
>;

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
    const template = templates[node.type || ''] || { shape: 'rectangle' };
    const widget = await miro.board.createShape({
      shape: template.shape,
      x: node.x,
      y: node.y,
      width: template.width ?? node.width,
      height: template.height ?? node.height,
      content: node.label || '',
      style:
        template.fillColor || template.color
          ? { fillColor: template.fillColor, color: template.color }
          : undefined,
    });
    const group = await miro.board.group({ items: [widget] });
    attachShapeMetadata(widget, {
      type: 'node',
      nodeId: node.id,
      groupId: group.id,
    });
    map[node.id] = widget;
  }
  return map;
}
