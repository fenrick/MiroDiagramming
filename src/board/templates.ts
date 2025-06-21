import templatesJson from '../../templates/shapeTemplates.json';
import connectorJson from '../../templates/connectorTemplates.json';
import type {
  ConnectorStyle,
  Frame,
  Group,
  GroupableItem,
  ShapeStyle,
  ShapeType,
  TextStyle,
} from '@mirohq/websdk-types';

/**
 * Single element of a shape template description.
 */
export interface TemplateElement {
  shape?: string;
  /** Hex color for the fill. Deprecated in favour of style.fillColor */
  fill?: string;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  position?: string;
  /** Additional style properties applied to the widget */
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
  shape?: 'straight' | 'elbowed' | 'curved';
  caption?: { position?: number; textAlignVertical?: string };
}

export interface ConnectorTemplateCollection {
  [key: string]: ConnectorTemplate;
}

export class TemplateManager {
  private static instance: TemplateManager;
  public readonly templates: TemplateCollection =
    templatesJson as TemplateCollection;
  public readonly connectorTemplates: ConnectorTemplateCollection =
    connectorJson as ConnectorTemplateCollection;

  private constructor() {}

  /** Access the singleton instance. */
  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  /** Lookup a shape template by name. */
  public getTemplate(name: string): TemplateDefinition | undefined {
    return this.templates[name];
  }

  /** Retrieve a connector styling template by name. */
  public getConnectorTemplate(name: string): ConnectorTemplate | undefined {
    const tpl = this.connectorTemplates[name];
    if (!tpl) return undefined;
    return { shape: 'curved', ...tpl };
  }

  /** Instantiate board widgets described by a template. */
  public async createFromTemplate(
    name: string,
    label: string,
    x: number,
    y: number,
    frame?: Frame,
  ): Promise<GroupableItem | Group> {
    const template = this.getTemplate(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }

    const created: GroupableItem[] = [];
    for (const el of template.elements) {
      if (el.shape) {
        const style: Partial<ShapeStyle> & Record<string, unknown> = {
          ...(el.style ?? {}),
        };
        if (el.fill && !style.fillColor) {
          style.fillColor = el.fill;
        }
        const shape = await miro.board.createShape({
          shape: el.shape as ShapeType,
          x,
          y,
          width: el.width,
          height: el.height,
          rotation: el.rotation ?? 0,
          content: (el.text ?? '{{label}}').replace('{{label}}', label),
          style: style as Partial<ShapeStyle>,
        });
        frame?.add(shape);
        created.push(shape);
      } else if (el.text) {
        const style: Partial<TextStyle> & Record<string, unknown> = {
          textAlign: 'center',
          ...(el.style ?? {}),
        };
        const text = await miro.board.createText({
          content: el.text.replace('{{label}}', label),
          x,
          y,
          style: style as Partial<TextStyle>,
        });
        frame?.add(text);
        created.push(text);
      }
    }

    if (created.length > 1) {
      return await miro.board.group({ items: created });
    }

    return created[0];
  }
}

export const templates = TemplateManager.getInstance().templates;
export const connectorTemplates =
  TemplateManager.getInstance().connectorTemplates;
export const templateManager = TemplateManager.getInstance();
