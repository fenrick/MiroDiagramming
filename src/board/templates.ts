import { colors } from '@mirohq/design-tokens'
import {
  type ConnectorStyle,
  type Frame,
  type Group,
  type GroupableItem,
  type ShapeStyle,
  type TextStyle,
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

export const SHAPE_TYPE = {
  Rectangle: 'rectangle',
  Circle: 'circle',
  Triangle: 'triangle',
  WedgeRoundRectangleCallout: 'wedge_round_rectangle_callout',
  RoundRectangle: 'round_rectangle',
  Rhombus: 'rhombus',
  Parallelogram: 'parallelogram',
  Star: 'star',
  RightArrow: 'right_arrow',
  LeftArrow: 'left_arrow',
  Pentagon: 'pentagon',
  Hexagon: 'hexagon',
  Octagon: 'octagon',
  Trapezoid: 'trapezoid',
  FlowChartPredefinedProcess: 'flow_chart_predefined_process',
  LeftRightArrow: 'left_right_arrow',
  Cloud: 'cloud',
  LeftBrace: 'left_brace',
  RightBrace: 'right_brace',
  Cross: 'cross',
  Can: 'can',
} as const

type TemplateShape = (typeof SHAPE_TYPE)[keyof typeof SHAPE_TYPE]

const SHAPE_WHITELIST: ReadonlySet<TemplateShape> = new Set<TemplateShape>([
  SHAPE_TYPE.Rectangle,
  SHAPE_TYPE.Circle,
  SHAPE_TYPE.Triangle,
  SHAPE_TYPE.WedgeRoundRectangleCallout,
  SHAPE_TYPE.RoundRectangle,
  SHAPE_TYPE.Rhombus,
  SHAPE_TYPE.Parallelogram,
  SHAPE_TYPE.Star,
  SHAPE_TYPE.RightArrow,
  SHAPE_TYPE.LeftArrow,
  SHAPE_TYPE.Pentagon,
  SHAPE_TYPE.Hexagon,
  SHAPE_TYPE.Octagon,
  SHAPE_TYPE.Trapezoid,
  SHAPE_TYPE.FlowChartPredefinedProcess,
  SHAPE_TYPE.LeftRightArrow,
  SHAPE_TYPE.Cloud,
  SHAPE_TYPE.LeftBrace,
  SHAPE_TYPE.RightBrace,
  SHAPE_TYPE.Cross,
  SHAPE_TYPE.Can,
])

const COLOR_LOOKUP = new Map<string, string>(Object.entries(colors as Record<string, string>))

const NEGATIVE_SIGN = '-'
const DOT = '.'

interface AliasDefinition {
  alias?: readonly string[]
}
interface ExperimentalOverride {
  templateKey: string
  shape: string
}

function stripNegativeSign(value: string): string {
  return value.startsWith(NEGATIVE_SIGN) ? value.slice(1) : value
}

function isDigitChar(char: string): boolean {
  return char >= '0' && char <= '9'
}

function hasOnlyDigitsAndDots(value: string): boolean {
  for (const char of value) {
    if (char !== DOT && !isDigitChar(char)) {
      return false
    }
  }
  return true
}

function containsDigit(value: string): boolean {
  for (const char of value) {
    if (isDigitChar(char)) {
      return true
    }
  }
  return false
}

function countDots(value: string): number {
  let count = 0
  for (const char of value) {
    if (char === DOT) {
      count += 1
    }
  }
  return count
}

function isSimpleNumber(value: string): boolean {
  const body = stripNegativeSign(value)
  if (body.length === 0) {
    return false
  }
  if (!hasOnlyDigitsAndDots(body)) {
    return false
  }
  if (!containsDigit(body)) {
    return false
  }
  return countDots(body) <= 1
}

export function normalizeTemplateShape(shape: string | undefined): TemplateShape {
  if (!shape) {
    return SHAPE_TYPE.Rectangle
  }
  if (shape === 'diamond') {
    return SHAPE_TYPE.Rhombus
  }
  if (shape.startsWith('flow_chart_') && shape !== SHAPE_TYPE.FlowChartPredefinedProcess) {
    return SHAPE_TYPE.Rectangle
  }
  return SHAPE_WHITELIST.has(shape as TemplateShape)
    ? (shape as TemplateShape)
    : SHAPE_TYPE.Rectangle
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
    this.registerAliases(this.templateMap.entries(), this.aliasMap)
    this.registerAliases(this.connectorTemplateMap.entries(), this.connectorAliasMap)

    // Apply experimental shape overrides when enabled via env flag.
    this.applyExperimentalOverrides()
  }

  private registerAliases(
    entries: Iterable<[string, AliasDefinition]>,
    target: Map<string, string>,
  ): void {
    for (const [key, definition] of entries) {
      this.registerDefinitionAliases(definition.alias, key, target)
    }
  }

  private registerDefinitionAliases(
    aliases: readonly string[] | undefined,
    key: string,
    target: Map<string, string>,
  ): void {
    if (!aliases) {
      return
    }
    for (const alias of aliases) {
      this.addAlias(target, alias, key)
    }
  }

  private addAlias(target: Map<string, string>, alias: string, key: string): void {
    const safeAlias = sanitizeObjectKey(alias, isSafeAliasKey)
    if (safeAlias) {
      target.set(safeAlias, key)
    }
  }

  private applyExperimentalOverrides(): void {
    const overrides = this.collectExperimentalOverrides()
    for (const override of overrides) {
      this.applyExperimentalOverride(override)
    }
  }

  private collectExperimentalOverrides(): ExperimentalOverride[] {
    if (!this.isExperimentalOverrideEnabled()) {
      return []
    }
    const overrideMapCandidate: unknown = experimentalShapeMap
    if (!isStringRecord(overrideMapCandidate)) {
      return []
    }
    const overrides: ExperimentalOverride[] = []
    for (const [name, shape] of Object.entries(overrideMapCandidate)) {
      const safeName = sanitizeObjectKey(name, isSafeAliasKey)
      if (!safeName) {
        continue
      }
      overrides.push({ templateKey: this.aliasMap.get(safeName) ?? safeName, shape })
    }
    return overrides
  }

  private isExperimentalOverrideEnabled(): boolean {
    const flag = readExperimentalShapesFlag()
    return typeof flag === 'string' ? flag.toLowerCase() !== 'false' : true
  }

  private applyExperimentalOverride(override: ExperimentalOverride): void {
    const template = this.templateMap.get(override.templateKey)
    if (!template || template.elements.length === 0) {
      return
    }
    // Experimental overrides are applied verbatim to allow aliases like 'diamond'.
    // Downstream shape clients can translate to SDK-specific names if needed.
    template.elements[0] = { ...template.elements[0], shape: override.shape }
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
    if (!isSimpleNumber(input)) {
      return null
    }
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
      shape: normalizeTemplateShape(element.shape),
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
