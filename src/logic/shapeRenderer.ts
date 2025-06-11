import { Shape } from '@mirohq/websdk-types';
import { PositionedNode } from './layoutEngine';
import { attachShapeMetadata } from './metadata';
import shapeTemplates from '../../templates/shapeTemplates.json';

interface ShapeTemplate {
  shape: string;
  fillColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
}

const templates: Record<string, ShapeTemplate> = shapeTemplates as Record<
  string,
  ShapeTemplate
>;

export interface WidgetMap {
  [nodeId: string]: Shape;
}

/**
 * Draw widgets for each node and return a mapping from node id to widget.
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
        template.fillColor || template.textColor
          ? { fillColor: template.fillColor, textColor: template.textColor }
          : undefined,
    });
    attachShapeMetadata(widget, { type: 'node', nodeId: node.id });
    map[node.id] = widget;
  }
  return map;
}
