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
   * Translate `tokens.color.*` references to concrete hex values.
   *
   * @param path - Token lookup path without the `tokens.` prefix.
   * @returns The resolved colour string or `undefined` when the path does not
   *   match the expected pattern.
   */
  private parseColorToken(path: string): string | undefined {
    const match = /^color\.([a-zA-Z]+)\[(\d+)\]$/.exec(path);
    if (!match) return undefined;
    const [, name, shade] = match;
    const palette = tokens as unknown as Record<
      string,
      Record<string, Record<string, string>>
    >;
    const token = palette.color?.[name]?.[shade];
    const fallback =
      (colors as Record<string, string>)[`${name}-${shade}`] ?? colors.white;
    return typeof token === 'string' ? resolveColor(token, fallback) : fallback;
  }

  /**
   * Resolve arbitrary token paths such as `tokens.space.small`.
   *
   * @param path - Dot-separated token path without the `tokens.` prefix.
   * @returns The token value or `undefined` if not found.
   */
  private lookupToken(path: string): unknown {
    let ref: unknown = tokens;
    for (const part of path.split('.')) {
      const m = /^([a-zA-Z]+)(?:\[(\d+)\])?$/.exec(part);
      if (!m) return undefined;
      ref = (ref as Record<string, unknown>)[m[1]];
      if (ref === undefined) return undefined;
      if (m[2]) ref = (ref as Record<string, unknown>)[m[2]];
    }
    return ref;
  }

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
    const color = this.parseColorToken(path);
    if (color !== undefined) return color;
    const token = this.lookupToken(path);
    return token ?? value;
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

  /** Create a shape widget for a template element. */
  private async createShapeWidget(
    element: TemplateElement,
    label: string,
    x: number,
    y: number,
    frame?: Frame,
  ): Promise<GroupableItem> {
    const style: Partial<ShapeStyle> & Record<string, unknown> =
      this.resolveStyle(element.style ?? {});
    if (element.fill && !style.fillColor) {
      style.fillColor = this.resolveToken(element.fill) as string;
    }
    const shape = await miro.board.createShape({
      shape: element.shape as ShapeType,
      x,
      y,
      width: element.width,
      height: element.height,
      rotation: element.rotation ?? 0,
      content: (element.text ?? '{{label}}').replace('{{label}}', label),
      style: style as Partial<ShapeStyle>,
    });
    frame?.add(shape);
    return shape;
  }

  /** Create a text widget for a template element. */
  private async createTextWidget(
    element: TemplateElement,
    label: string,
    x: number,
    y: number,
    frame?: Frame,
  ): Promise<GroupableItem> {
    const style: Partial<TextStyle> & Record<string, unknown> = {
      textAlign: 'center',
      ...this.resolveStyle(element.style ?? {}),
    };
    const text = await miro.board.createText({
      content: element.text?.replace('{{label}}', label) ?? label,
      x,
      y,
      style: style as Partial<TextStyle>,
    });
    frame?.add(text);
    return text;
  }

  private getElementType(
    element: TemplateElement,
  ): 'shape' | 'text' | undefined {
    if (element.shape) return 'shape';
    if (element.text) return 'text';
    return undefined;
  }

  private async createElement(
    element: TemplateElement,
    label: string,
    x: number,
    y: number,
    frame?: Frame,
  ): Promise<GroupableItem | undefined> {
    switch (this.getElementType(element)) {
      case 'shape':
        return this.createShapeWidget(element, label, x, y, frame);
      case 'text':
        return this.createTextWidget(element, label, x, y, frame);
      default:
        return undefined;
    }
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
      const item = await this.createElement(el, label, x, y, frame);
      if (item) created.push(item);
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
