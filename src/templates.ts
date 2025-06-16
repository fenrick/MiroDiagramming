import templatesJson from '../templates/shapeTemplates.json';
import type { Group, GroupableItem, ShapeType } from '@mirohq/websdk-types';

export interface TemplateElement {
  shape?: string;
  fill?: string;
  width?: number;
  height?: number;
  text?: string;
  position?: string;
}

export interface TemplateDefinition {
  elements: TemplateElement[];
}

export interface TemplateCollection {
  [key: string]: TemplateDefinition;
}

export const templates: TemplateCollection =
  templatesJson as TemplateCollection;

export function getTemplate(name: string): TemplateDefinition | undefined {
  return templates[name];
}

export async function createFromTemplate(
  name: string,
  label: string,
  x: number,
  y: number
): Promise<GroupableItem | Group> {
  const template = getTemplate(name);
  if (!template) {
    throw new Error(`Template '${name}' not found`);
  }

  const created: GroupableItem[] = [];
  for (const el of template.elements) {
    if (el.shape) {
      const shape = await miro.board.createShape({
        shape: el.shape as ShapeType,
        x,
        y,
        width: el.width,
        height: el.height,
        content: (el.text ?? '{{label}}').replace('{{label}}', label),
        style: { fillColor: el.fill },
      });
      created.push(shape);
    } else if (el.text) {
      const text = await miro.board.createText({
        content: el.text.replace('{{label}}', label),
        x,
        y,
        style: { textAlign: 'center' },
      });
      created.push(text);
    }
  }

  if (created.length > 1) {
    const group = await miro.board.group({ items: created });
    return group;
  }

  return created[0];
}
