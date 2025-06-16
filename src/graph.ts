import type { Shape } from '@mirohq/websdk-types';

export async function getShapeByMetadata(
  type: string,
  label: string
): Promise<Shape | undefined> {
  const items = await miro.board.get({
    type: 'shape',
    metadata: { type, label },
  });

  return (items[0] as Shape) ?? undefined;
}

export interface CreateNodeOptions {
  type: string;
  label: string;
  x?: number;
  y?: number;
  shape?: string;
  fillColor?: string;
  color?: string;
  width?: number;
  height?: number;
}

export async function createNode(options: CreateNodeOptions): Promise<Shape> {
  const existing = await getShapeByMetadata(options.type, options.label);
  if (existing) return existing;

  const shape = await miro.board.createShape({
    content: options.label,
    x: options.x ?? 0,
    y: options.y ?? 0,
    shape: options.shape ?? 'round_rectangle',
    fillColor: options.fillColor,
    color: options.color,
    width: options.width,
    height: options.height,
    metadata: { type: options.type, label: options.label },
  });

  return shape as Shape;
}
