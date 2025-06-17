import templatesJson from '../templates/shapeTemplates.json';
import connectorJson from '../templates/connectorTemplates.json';
import type {
  Group,
  GroupableItem,
  ShapeType,
  ConnectorStyle,
} from '@mirohq/websdk-types';

/**
 * Single element of a shape template description.
 */
export interface TemplateElement {
  shape?: string;
  fill?: string;
  width?: number;
  height?: number;
  text?: string;
  position?: string;
  style?: Record<string, unknown>;
}

export interface TemplateDefinition {
  elements: TemplateElement[];
}

export interface TemplateCollection {
  [key: string]: TemplateDefinition;
}

/** Definition for connector styling templates. */
export interface ConnectorTemplate {
  style?: ConnectorStyle & Record<string, unknown>;
}

export interface ConnectorTemplateCollection {
  [key: string]: ConnectorTemplate;
}

export const templates: TemplateCollection =
  templatesJson as TemplateCollection;

export const connectorTemplates: ConnectorTemplateCollection =
  connectorJson as ConnectorTemplateCollection;

/** Lookup a shape template by name. */
export function getTemplate(name: string): TemplateDefinition | undefined {
  return templates[name];
}

/** Retrieve a connector styling template by name. */
export function getConnectorTemplate(
  name: string
): ConnectorTemplate | undefined {
  return connectorTemplates[name];
}

/**
 * Instantiate board widgets described by a template.
 */
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
        style: {
          ...(el.style ?? {}),
          fillColor: el.fill ?? (el.style as any)?.fillColor,
        },
      });
      created.push(shape);
    } else if (el.text) {
      const text = await miro.board.createText({
        content: el.text.replace('{{label}}', label),
        x,
        y,
        style: { textAlign: 'center', ...(el.style ?? {}) },
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
