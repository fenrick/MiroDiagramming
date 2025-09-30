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
import {
  isSafeAliasKey,
  isSafeLookupKey,
  isSafeStyleProperty,
  sanitizeObjectKey,
} from '../core/utils/object-safety'
import connectorJson from '../../templates/connectorTemplates.json'
import templatesJson from '../../templates/shapeTemplates.json'
import experimentalShapeMap from '../../templates/experimentalShapeMap.json'

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

export type TemplateCollection = Record<string, TemplateDefinition>

/** Definition for connector styling templates. */
export interface ConnectorTemplate {
  style?: ConnectorStyle & Record<string, unknown>
  shape?: 'straight' | 'elbowed' | 'curved'
  caption?: { position?: number; textAlignVertical?: string }
  /** Alternative names referring to this template. */
  alias?: string[]
}

export type ConnectorTemplateCollection = Record<string, ConnectorTemplate>

const TEMPLATE_KEY_PATTERN = (value: string): boolean => isSafeAliasKey(value)

const SHAPE_WHITELIST = new Set<ShapeType>([
  'rectangle',
  'circle',
  'triangle',
  'wedge_round_rectangle_callout',
  'round_rectangle',
  'rhombus',
  'parallelogram',
  'star',
  'right_arrow',
  'left_arrow',
  'pentagon',
  'hexagon',
  'octagon',
  'trapezoid',
  'flow_chart_predefined_process',
  'left_right_arrow',
  'cloud',
  'left_brace',
  'right_brace',
  'cross',
  'can',
  'text',
])

const COLOR_LOOKUP = new Map<string, string>(Object.entries(colors as Record<string, string>))

function sanitizeShapeType(shape: string | undefined): ShapeType {
  if (!shape) {
    return 'rectangle'
  }
  if (shape === 'diamond') {
    return 'rhombus'
  }
  if (shape.startsWith('flow_chart_') && shape !== 'flow_chart_predefined_process') {
    return 'rectangle'
  }
  return (SHAPE_WHITELIST.has(shape as ShapeType) ? shape : 'rectangle') as ShapeType
}

function buildTemplateEntries(raw: Record<string, unknown>): [string, TemplateDefinition][] {
  const entries: [string, TemplateDefinition][] = []
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'stylePresets') {
      continue
    }
    const safeKey = sanitizeObjectKey(key, TEMPLATE_KEY_PATTERN)
    if (!safeKey) {
      continue
    }
    entries.push([safeKey, value as TemplateDefinition])
  }
  return entries
}

function buildConnectorEntries(
  raw: Record<string, ConnectorTemplate>,
): [string, ConnectorTemplate][] {
  const entries: [string, ConnectorTemplate][] = []
  for (const [key, value] of Object.entries(raw)) {
    const safeKey = sanitizeObjectKey(key, TEMPLATE_KEY_PATTERN)
    if (!safeKey) {
      continue
    }
    entries.push([safeKey, value])
  }
  return entries
}

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (value === null || typeof value !== 'object') {
    return false
  }
  return Object.values(value).every((entry) => typeof entry === 'string')
}

const readExperimentalShapesFlag = (): string | undefined => {
  const meta: unknown = import.meta
  if (typeof meta !== 'object' || meta === null) {
    return undefined
  }

  const environment = (meta as { readonly env?: unknown }).env
  if (typeof environment !== 'object' || environment === null) {
    return undefined
  }

  const flag = (environment as Record<string, unknown>).VITE_MIRO_EXPERIMENTAL_SHAPES
  return typeof flag === 'string' ? flag : undefined
}

export class TemplateManager {
  private static instance: TemplateManager | null = null
  private static readonly rawTemplates = templatesJson as Record<string, unknown>
  private static readonly rawConnectorTemplates = connectorJson as Record<string, ConnectorTemplate>
  private static readonly templateEntries = buildTemplateEntries(TemplateManager.rawTemplates)
  private static readonly connectorEntries = buildConnectorEntries(
    TemplateManager.rawConnectorTemplates,
  )
  public readonly templates: TemplateCollection = Object.fromEntries(
    TemplateManager.templateEntries,
  ) as TemplateCollection
  public readonly connectorTemplates: ConnectorTemplateCollection = Object.fromEntries(
    TemplateManager.connectorEntries,
  ) as ConnectorTemplateCollection
  private readonly templateMap = new Map<string, TemplateDefinition>(
    TemplateManager.templateEntries,
  )
  private readonly connectorTemplateMap = new Map<string, ConnectorTemplate>(
    TemplateManager.connectorEntries,
  )
  private readonly aliasMap = new Map<string, string>()
  private readonly connectorAliasMap = new Map<string, string>()
  private readonly api = new ShapeClient()

  private constructor() {
    for (const [key, definition] of this.templateMap.entries()) {
      if (!definition.alias) {
        continue
      }
      for (const alias of definition.alias) {
        const safeAlias = sanitizeObjectKey(alias, isSafeAliasKey)
        if (safeAlias) {
          this.aliasMap.set(safeAlias, key)
        }
      }
    }

    for (const [key, definition] of this.connectorTemplateMap.entries()) {
      if (!definition.alias) {
        continue
      }
      for (const alias of definition.alias) {
        const safeAlias = sanitizeObjectKey(alias, isSafeAliasKey)
        if (safeAlias) {
          this.connectorAliasMap.set(safeAlias, key)
        }
      }
    }

    // Apply experimental shape overrides when enabled via env flag.
    this.applyExperimentalOverrides()
  }

  private applyExperimentalOverrides(): void {
    const flag = readExperimentalShapesFlag()
    const expEnabled = typeof flag === 'string' ? flag.toLowerCase() !== 'false' : true
    if (!expEnabled) {
      return
    }
    const overrideMapCandidate: unknown = experimentalShapeMap
    if (!isStringRecord(overrideMapCandidate)) {
      return
    }
    const overrideMap = overrideMapCandidate
    for (const [name, shape] of Object.entries(overrideMap)) {
      const safeName = sanitizeObjectKey(name, isSafeAliasKey)
      if (!safeName) {
        continue
      }
      const key = this.aliasMap.get(safeName) ?? safeName
      const tpl = this.templateMap.get(key)
      if (tpl && Array.isArray(tpl.elements) && tpl.elements.length > 0) {
        // Experimental overrides are applied verbatim to allow aliases like 'diamond'.
        // Downstream shape clients can translate to SDK-specific names if needed.
        tpl.elements[0] = { ...tpl.elements[0], shape }
      }
    }
  }

  /**
   * Resolve arbitrary token paths such as `tokens.space.small`.
   *
   * @param path - Dot-separated token path without the `tokens.` prefix.
   * @returns The token value or `undefined` if not found.
   */

  /** Access the singleton instance. */
  public static getInstance(): TemplateManager {
    TemplateManager.instance ??= new TemplateManager()
    return TemplateManager.instance
  }

  /** Apply token and numeric resolution to style values. */
  public resolveStyle(style: Record<string, unknown>): Record<string, unknown> {
    const entries: [string, unknown][] = []
    for (const [key, value] of Object.entries(style)) {
      const safeKey = sanitizeObjectKey(key, isSafeStyleProperty)
      if (!safeKey) {
        continue
      }
      const token = this.resolveToken(value)
      entries.push([safeKey, this.parseNumeric(token)])
    }
    return Object.fromEntries(entries) as Record<string, unknown>
  }

  /** Lookup a shape template by name. */
  public getTemplate(name: string): TemplateDefinition | undefined {
    const safeName = sanitizeObjectKey(name, isSafeAliasKey)
    if (!safeName) {
      return undefined
    }
    const direct = this.templateMap.get(safeName)
    if (direct) {
      return direct
    }
    const alias = this.aliasMap.get(safeName)
    return alias ? this.templateMap.get(alias) : undefined
  }

  /** Retrieve a connector styling template by name. */
  public getConnectorTemplate(name: string): ConnectorTemplate | undefined {
    const safeName = sanitizeObjectKey(name, isSafeAliasKey)
    if (!safeName) {
      return undefined
    }
    const key = this.connectorTemplateMap.has(safeName)
      ? safeName
      : this.connectorAliasMap.get(safeName)
    const tpl = key ? this.connectorTemplateMap.get(key) : undefined
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
    if (shapes.length === 0) {
      return undefined
    }
    const createdShapes = await this.api.createShapes(shapes)
    const items = await this.fetchCreatedItems(createdShapes as GroupableItem[], frame)
    if (items.length > 1) {
      return await miro.board.group({ items })
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
    for (const [index, element] of template.elements.entries()) {
      const data = this.createElement(
        index === 0 && overrideSize
          ? { ...element, width: overrideSize.width, height: overrideSize.height }
          : element,
        label,
        x,
        y,
      )
      if (data) {
        shapes.push(data)
      }
    }
    return shapes
  }

  private async fetchCreatedItems(
    results: GroupableItem[],
    frame?: Frame,
  ): Promise<GroupableItem[]> {
    const items: GroupableItem[] = []
    for (const item of results) {
      if (frame) {
        await frame.add(item)
      }
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
    const name = match[1]
    const shade = match[2]
    if (!name || !shade) {
      return undefined
    }
    const key = `${name}-${shade}`
    const safeKey = sanitizeObjectKey(key, isSafeLookupKey)
    if (!safeKey) {
      return undefined
    }
    return COLOR_LOOKUP.get(safeKey)
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
    const trimmed = value.trim()
    const core = trimmed.endsWith('px') ? trimmed.slice(0, -2) : trimmed
    const parsed = this.parseSimpleNumber(core)
    return parsed ?? value
  }

  private parseSimpleNumber(input: string): number | null {
    if (input.length === 0) return null
    let index = 0
    if (input.startsWith('-')) {
      index = 1
      if (index >= input.length) return null
    }
    let digitCount = 0
    let dotCount = 0
    for (; index < input.length; index += 1) {
      const ch = input.charAt(index)
      if (ch >= '0' && ch <= '9') {
        digitCount += 1
        continue
      }
      if (ch === '.') {
        dotCount += 1
        if (dotCount > 1) return null
        continue
      }
      return null
    }
    if (digitCount === 0) return null
    return Number.parseFloat(input)
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
      shape: sanitizeShapeType(element.shape),
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
      case 'shape': {
        return this.createShapeData(element, label, x, y)
      }
      case 'text': {
        return this.createTextData(element, label, x, y)
      }
      default: {
        return undefined
      }
    }
  }
}

/** Convenience reference to the raw shape template definitions. */
export const templates = TemplateManager.getInstance().templates

/** Convenience reference to the raw connector template definitions. */
export const connectorTemplates = TemplateManager.getInstance().connectorTemplates

/** Singleton instance used throughout the app. */
export const templateManager = TemplateManager.getInstance()
