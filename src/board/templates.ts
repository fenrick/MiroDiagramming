import templatesJson from '../../templates/shapeTemplates.json';
import connectorJson from '../../templates/connectorTemplates.json';
import { tokens } from '../ui/tokens';
import { colors } from '@mirohq/design-tokens';
import { resolveColor } from '../core/utils/color-utils';
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
  /**
   * Optional index of the element that stores metadata when grouped.
   * If omitted, metadata is applied to every element.
   */
  masterElement?: number;
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
  public readonly templates: TemplateCollection = Object.fromEntries(
    Object.entries(templatesJson).filter(([k]) => k !== 'stylePresets'),
  ) as TemplateCollection;
  public readonly connectorTemplates: ConnectorTemplateCollection =
    connectorJson as ConnectorTemplateCollection;

  /**
   * Resolve design-token identifiers to concrete values.
   *
   * Currently supports `tokens.color.*` paths which are converted to the
   * corresponding CSS variable and resolved to a hex fallback using
   * {@link resolveColor}.
   */
  private resolveToken(value: unknown): unknown {
    if (typeof value !== 'string' || !value.startsWith('tokens.')) return value;
    const path = value.slice('tokens.'.length);
    const colorMatch = /^color\.([a-zA-Z]+)\[(\d+)\]$/.exec(path);
    if (colorMatch) {
      const [, name, shade] = colorMatch;
      const palette = tokens as unknown as Record<
        string,
        Record<string, Record<string, string>>
      >;
      const token = palette.color?.[name]?.[shade];
      const fallback =
        (colors as Record<string, string>)[`${name}-${shade}`] ?? colors.white;
      return typeof token === 'string'
        ? resolveColor(token, fallback)
        : fallback;
    }
    // generic token access e.g. tokens.typography.fontWeight.bold
    let ref: unknown = tokens;
    for (const part of path.split('.')) {
      const m = /^([a-zA-Z]+)(?:\[(\d+)\])?$/.exec(part);
      if (!m) return value;
      ref = (ref as Record<string, unknown>)[m[1]];
      if (ref === undefined) return value;
      if (m[2]) ref = (ref as Record<string, unknown>)[m[2]];
    }
    return ref ?? value;
  }

  /** Apply token resolution to all string properties in the provided object. */
  public resolveStyle(style: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    Object.entries(style).forEach(([k, v]) => {
      result[k] = this.resolveToken(v);
    });
    return result;
  }
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
    const style = tpl.style ? this.resolveStyle(tpl.style) : undefined;
    return { shape: 'curved', ...tpl, style };
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
        const style: Partial<ShapeStyle> & Record<string, unknown> =
          this.resolveStyle(el.style ?? {});
        if (el.fill && !style.fillColor) {
          style.fillColor = this.resolveToken(el.fill) as string;
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
          ...this.resolveStyle(el.style ?? {}),
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

/** Convenience reference to the raw shape template definitions. */
export const templates = TemplateManager.getInstance().templates;

/** Convenience reference to the raw connector template definitions. */
export const connectorTemplates =
  TemplateManager.getInstance().connectorTemplates;

/** Singleton instance used throughout the app. */
export const templateManager = TemplateManager.getInstance();
