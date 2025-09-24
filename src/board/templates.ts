import { colors } from '@mirohq/design-tokens'
import type {
  ConnectorStyle,
  Frame,
  Group,
  GroupableItem,
  ShapeStyle,
  ShapeType,
  TextStyle,
} from '@mirohq/websdk-types'

import { ShapeClient, type ShapeData } from '../core/utils/shape-client'
import connectorJson from '../../templates/connectorTemplates.json'
import templatesJson from '../../templates/shapeTemplates.json'

/**
 * Single element of a shape template description.
 */
export interface TemplateElement {
  shape?: string
  /** Hex color for the fill. Deprecated in favour of style.fillColor */
  fill?: string
  width?: number
  height?: number
  rotation?: number
  text?: string
  position?: string
  /** Additional style properties applied to the widget */
  style?: Record<string, unknown>
}

export interface TemplateDefinition {
  elements: TemplateElement[]
  /**
   * Optional index of the element that stores metadata when grouped.
   * If omitted, metadata is applied to every element.
   */
  masterElement?: number
  /** Alternate names that refer to this template. */
  alias?: string[]
}

export interface TemplateCollection {
  [key: string]: TemplateDefinition
}

/** Definition for connector styling templates. */
export interface ConnectorTemplate {
  style?: ConnectorStyle & Record<string, unknown>
  shape?: 'straight' | 'elbowed' | 'curved'
  caption?: { position?: number; textAlignVertical?: string }
  /** Alternative names referring to this template. */
  alias?: string[]
}

export interface ConnectorTemplateCollection {
  [key: string]: ConnectorTemplate
}

export class TemplateManager {
  private static instance: TemplateManager
  private static readonly rawTemplates = templatesJson as Record<string, unknown>
  public readonly templates: TemplateCollection = Object.fromEntries(
    Object.entries(TemplateManager.rawTemplates)
      .filter(([k]) => k !== 'stylePresets')
      .map(([key, value]) => [key, value as TemplateDefinition]),
  ) as TemplateCollection
  public readonly connectorTemplates: ConnectorTemplateCollection =
    (connectorJson as Record<string, ConnectorTemplate>) ?? {}
  private readonly aliasMap: Record<string, string> = {}
  private readonly connectorAliasMap: Record<string, string> = {}
  private readonly api = new ShapeClient()

  private constructor() {
    Object.entries(this.templates).forEach(([key, def]) =>
      def.alias?.forEach((a) => {
        this.aliasMap[a] = key
      }),
    )
    Object.entries(this.connectorTemplates).forEach(([key, def]) =>
      def.alias?.forEach((a) => {
        this.connectorAliasMap[a] = key
      }),
    )
  }

  /**
   * Resolve arbitrary token paths such as `tokens.space.small`.
   *
   * @param path - Dot-separated token path without the `tokens.` prefix.
   * @returns The token value or `undefined` if not found.
   */

  /** Access the singleton instance. */
  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager()
    }
    return TemplateManager.instance
  }

  /** Apply token and numeric resolution to style values. */
  public resolveStyle(style: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    Object.entries(style).forEach(([k, v]) => {
      const token = this.resolveToken(v)
      result[k] = this.parseNumeric(token)
    })
    return result
  }

  /** Lookup a shape template by name. */
  public getTemplate(name: string): TemplateDefinition | undefined {
    const direct = this.templates[name]
    if (direct) {
      return direct
    }
    const alias = this.aliasMap[name]
    return alias ? this.templates[alias] : undefined
  }

  /** Retrieve a connector styling template by name. */
  public getConnectorTemplate(name: string): ConnectorTemplate | undefined {
    const key = name in this.connectorTemplates ? name : this.connectorAliasMap[name]
    const tpl = key ? this.connectorTemplates[key] : undefined
    if (!tpl) {
      return undefined
    }
    const style = tpl.style ? this.resolveStyle(tpl.style) : undefined
    return { shape: 'curved', ...tpl, style }
  }

  /** Instantiate board widgets described by a template. */
  public async createFromTemplate(
    name: string,
    label: string,
    x: number,
    y: number,
    frame?: Frame,
    overrideSize?: { width: number; height: number },
  ): Promise<GroupableItem | Group | undefined> {
    const template = this.getTemplate(name)
    if (!template) {
      throw new Error(`Template '${name}' not found`)
    }

    const shapes = this.buildShapes(template, label, x, y, overrideSize)
    if (!shapes.length) {
      return undefined
    }
    const createdShapes = await this.api.createShapes(shapes)
    const items = await this.fetchCreatedItems(createdShapes as GroupableItem[], frame)
    if (items.length > 1) {
      return (await miro.board.group({ items })) as Group
    }

    return items[0]
  }

  private buildShapes(
    template: TemplateDefinition,
    label: string,
    x: number,
    y: number,
    overrideSize?: { width: number; height: number },
  ): ShapeData[] {
    const shapes: ShapeData[] = []
    template.elements.forEach((el, idx) => {
      const data = this.createElement(
        idx === 0 && overrideSize
          ? { ...el, width: overrideSize.width, height: overrideSize.height }
          : el,
        label,
        x,
        y,
      )
      if (data) {
        shapes.push(data)
      }
    })
    return shapes
  }

  private async fetchCreatedItems(
    results: Array<GroupableItem>,
    frame?: Frame,
  ): Promise<GroupableItem[]> {
    const items: GroupableItem[] = []
    for (const item of results) {
      frame?.add(item)
      items.push(item)
    }
    return items
  }

  /**
   * Translate `tokens.color.*` references to concrete hex values.
   *
   * @param path - Token lookup path without the `tokens.` prefix.
   * @returns The resolved colour string or `undefined` when the path does not
   *   match the expected pattern.
   */
  private parseColorToken(path: string): string | undefined {
    if (path === 'color.white') {
      return colors.white
    }
    if (path === 'color.black') {
      return colors.black
    }
    const match = /^color\.([a-zA-Z]+)\[(\d+)\]$/.exec(path)
    if (!match) {
      return undefined
    }
    const [, name, shade] = match
    const key = `${name}-${shade}`
    return (colors as Record<string, string>)[key]
  }

  /**
   * Resolve design-token identifiers to concrete values.
   *
   * Currently supports `tokens.color.*` paths which are converted to the
   * corresponding value from the design tokens.
   */
  private resolveToken(value: unknown): unknown {
    if (typeof value !== 'string' || !value.startsWith('tokens.')) {
      return value
    }
    const path = value.slice('tokens.'.length)
    const color = this.parseColorToken(path)
    return color ?? value
  }

  /**
   * Convert numeric strings into numbers while leaving other values intact.
   *
   * Supports optional `px` units which are stripped off.
   */
  private parseNumeric(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value
    }
    const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(value)
    return m ? Number.parseFloat(m[1]!) : value
  }

  /** Create shape data for a template element. */
  private createShapeData(
    element: TemplateElement,
    label: string,
    x: number,
    y: number,
  ): ShapeData {
    const style: Partial<ShapeStyle> & Record<string, unknown> = this.resolveStyle(
      element.style ?? {},
    )
    if (element.fill && !style.fillColor) {
      style.fillColor = this.resolveToken(element.fill) as string
    }
    return {
      shape: element.shape as ShapeType,
      x,
      y,
      width: element.width ?? 0,
      height: element.height ?? 0,
      rotation: element.rotation ?? 0,
      text: (element.text ?? '{{label}}').replace('{{label}}', label),
      style,
    }
  }

  /** Create text data for a template element. */
  private createTextData(element: TemplateElement, label: string, x: number, y: number): ShapeData {
    const style: Partial<TextStyle> & Record<string, unknown> = {
      textAlign: 'center',
      ...this.resolveStyle(element.style ?? {}),
    }
    return {
      shape: 'text',
      x,
      y,
      width: element.width ?? 0,
      height: element.height ?? 0,
      rotation: element.rotation ?? 0,
      text: element.text?.replace('{{label}}', label) ?? label,
      style,
    }
  }

  private getElementType(element: TemplateElement): 'shape' | 'text' | undefined {
    if (element.shape) {
      return 'shape'
    }
    if (element.text) {
      return 'text'
    }
    return undefined
  }

  private createElement(
    element: TemplateElement,
    label: string,
    x: number,
    y: number,
  ): ShapeData | undefined {
    switch (this.getElementType(element)) {
      case 'shape':
        return this.createShapeData(element, label, x, y)
      case 'text':
        return this.createTextData(element, label, x, y)
      default:
        return undefined
    }
  }
}

/** Convenience reference to the raw shape template definitions. */
export const templates = TemplateManager.getInstance().templates

/** Convenience reference to the raw connector template definitions. */
export const connectorTemplates = TemplateManager.getInstance().connectorTemplates

/** Singleton instance used throughout the app. */
export const templateManager = TemplateManager.getInstance()
