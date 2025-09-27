import mermaid from 'mermaid'

import type { EdgeData, GraphData, NodeData } from '../graph/graph-service'

import { ensureMermaidInitialized } from './config'
import { mapEdgeClassesToTemplate, mapNodeClassesToTemplate } from './template-map'

export class MermaidConversionError extends Error {
  public constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'MermaidConversionError'
  }
}

export interface MermaidConversionOptions {
  /** Optional override for mermaid configuration. */
  config?: Parameters<typeof mermaid.initialize>[0]
  /** Explicit diagram type guard; inferred automatically when omitted. */
  expectedType?: 'flowchart' | 'flowchart-v2'
}

type RawVertex = {
  id: string
  text?: string
  type?: string
  shape?: string
  classes?: string[]
  styles?: string[]
  domId?: string
  props?: Record<string, unknown>
}

type RawEdge = {
  id: string
  start: string
  end: string
  text?: string
  type?: string
  interpolate?: string
  stroke?: string
  classes?: string[]
  styles?: string[]
}

type FlowchartDb = {
  getVertices?: () => Map<string, RawVertex> | undefined
  getEdges?: () => RawEdge[] | undefined
}

const SUPPORTED_TYPES = new Set(['flowchart', 'flowchart-v2'])

const SHAPE_MAP: Record<string, string> = {
  rect: 'rectangle',
  rectangle: 'rectangle',
  square: 'rectangle',
  round_rect: 'round_rectangle',
  stadium: 'round_rectangle',
  circle: 'circle',
  diamond: 'diamond',
  rhombus: 'diamond',
  hexagon: 'hexagon',
}

const EDGE_THICKNESS: Record<string, number> = {
  'edge-thickness-thin': 1,
  'edge-thickness-thick': 4,
  'edge-thickness-invisible': 0,
}

const EDGE_PATTERN: Record<string, 'dashed' | 'dotted'> = {
  'edge-pattern-dashed': 'dashed',
  'edge-pattern-dotted': 'dotted',
}

type NodeStyleOverrides = {
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  textColor?: string
}

type EdgeStyleOverrides = {
  strokeColor?: string
  strokeWidth?: number
  strokeStyle?: 'dashed' | 'dotted'
  color?: string
}

type SequenceParticipant = {
  id: string
  label: string
}

function normaliseLabel(candidate: string | undefined, fallback: string): string {
  if (typeof candidate !== 'string') {
    return fallback
  }
  const trimmed = candidate.trim()
  return trimmed.length ? trimmed : fallback
}

function parseCssDeclarations(entries?: string[]): Record<string, string> {
  const declarations: Record<string, string> = {}
  if (!entries) {
    return declarations
  }
  for (const entry of entries) {
    if (!entry) continue
    const rules = entry
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean)
    for (const rule of rules) {
      const [rawProp, rawValue] = rule.split(':')
      if (!rawProp || rawValue === undefined) continue
      const prop = rawProp.trim().toLowerCase()
      const value = rawValue.trim()
      if (!value) continue
      declarations[prop] = value
    }
  }
  return declarations
}

function parseLength(value: string | undefined): number | undefined {
  if (!value) return undefined
  const numeric = Number.parseFloat(value.replace(/px$/i, ''))
  return Number.isFinite(numeric) ? numeric : undefined
}

function parseNodeStyles(vertex: RawVertex): NodeStyleOverrides | undefined {
  const css = parseCssDeclarations(vertex.styles)
  const overrides: NodeStyleOverrides = {}
  if (css.fill) {
    overrides.fillColor = css.fill
  }
  if (css.stroke) {
    overrides.borderColor = css.stroke
  }
  const borderWidth = parseLength(css['stroke-width'])
  if (borderWidth !== undefined) {
    overrides.borderWidth = borderWidth
  }
  if (css.color) {
    overrides.textColor = css.color
  }
  return Object.keys(overrides).length ? overrides : undefined
}

function parseEdgeStyles(edge: RawEdge): EdgeStyleOverrides | undefined {
  const css = parseCssDeclarations(edge.styles)
  const overrides: EdgeStyleOverrides = {}
  if (css.stroke) {
    overrides.strokeColor = css.stroke
  }
  const strokeWidth = parseLength(css['stroke-width'])
  if (strokeWidth !== undefined) {
    overrides.strokeWidth = strokeWidth
  }
  if (css.color) {
    overrides.color = css.color
  }
  const patternFromClasses = edge.classes?.map((cls) => EDGE_PATTERN[cls]).find(Boolean)
  const patternFromStroke =
    edge.stroke === 'dashed' || edge.stroke === 'dotted' ? edge.stroke : undefined
  overrides.strokeStyle = patternFromStroke ?? patternFromClasses
  if (!overrides.strokeWidth) {
    const widthFromClass = edge.classes
      ?.map((cls) => EDGE_THICKNESS[cls])
      .find((value) => value !== undefined)
    if (widthFromClass !== undefined) {
      overrides.strokeWidth = widthFromClass
    }
  }
  return Object.keys(overrides).length ? overrides : undefined
}

function mapShape(shape?: string): string | undefined {
  if (!shape) {
    return undefined
  }
  return SHAPE_MAP[shape.toLowerCase()]
}

function sanitizeIdentifier(raw: string): string {
  let value = raw
  if (value.startsWith('"')) {
    value = value.slice(1)
  }
  if (value.endsWith('"')) {
    value = value.slice(0, -1)
  }
  return value
}

function ensureUniqueNode(
  nodes: NodeData[],
  id: string,
  label: string,
  type: string = 'MermaidNode',
): void {
  if (nodes.some((node) => node.id === id)) {
    return
  }
  nodes.push({ id, label, type })
}

function parseParticipantLine(line: string): SequenceParticipant | undefined {
  const cleaned = line.replace(/^(participant|actor)\s+/i, '')
  const lower = cleaned.toLowerCase()
  const asIndex = lower.indexOf(' as ')
  let rawName = cleaned
  let rawAlias: string | undefined
  if (asIndex >= 0) {
    rawName = cleaned.slice(0, asIndex)
    rawAlias = cleaned.slice(asIndex + 4)
  }
  if (!rawName) {
    return undefined
  }
  const alias = sanitizeIdentifier((rawAlias ?? rawName).trim())
  const label = sanitizeIdentifier(rawName.trim())
  return alias ? { id: alias, label } : undefined
}

const SEQUENCE_ARROWS = [
  '-->>',
  '->>',
  '..>>',
  '-->',
  '..>',
  '->',
  '--',
  '..',
  '-x',
  'x-',
]

function parseMessageLine(line: string): { from: string; to: string; arrow: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : undefined
  const messagePart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  for (const arrow of SEQUENCE_ARROWS) {
    const idx = messagePart.indexOf(arrow)
    if (idx > 0) {
      const from = messagePart.slice(0, idx).trim()
      const to = messagePart.slice(idx + arrow.length).trim()
      if (from && to) {
        return { from, to, arrow, label: label?.length ? label : undefined }
      }
    }
  }
  return undefined
}

function mapSequenceArrow(arrow: string): { template: string; styleOverrides?: EdgeStyleOverrides } {
  const overrides: EdgeStyleOverrides = {}
  if (arrow.includes('--')) {
    overrides.strokeStyle = 'dashed'
  }
  if (arrow.includes('..')) {
    overrides.strokeStyle = 'dotted'
  }
  return {
    template: arrow.includes('>>') ? 'flow' : 'default',
    styleOverrides: Object.keys(overrides).length ? overrides : undefined,
  }
}

function convertSequenceDiagram(source: string): GraphData {
  const participants = new Map<string, SequenceParticipant>()
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []

  const processParticipant = (line: string) => {
    const participant = parseParticipantLine(line)
    if (participant && !participants.has(participant.id)) {
      participants.set(participant.id, participant)
      ensureUniqueNode(nodes, participant.id, participant.label)
    }
  }

  const processMessage = (line: string) => {
    const message = parseMessageLine(line)
    if (!message) {
      return
    }
    if (!participants.has(message.from)) {
      participants.set(message.from, { id: message.from, label: message.from })
      ensureUniqueNode(nodes, message.from, message.from)
    }
    if (!participants.has(message.to)) {
      participants.set(message.to, { id: message.to, label: message.to })
      ensureUniqueNode(nodes, message.to, message.to)
    }
    const arrowMeta = mapSequenceArrow(message.arrow)
    edges.push({
      from: message.from,
      to: message.to,
      label: message.label,
      metadata: {
        template: arrowMeta.template,
        styleOverrides: arrowMeta.styleOverrides,
      },
    })
  }

  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length && !line.startsWith('%%') && !/^sequenceDiagram/i.test(line))
    .forEach((line) => {
      if (/^(participant|actor)\s+/i.test(line)) {
        processParticipant(line)
      } else if (!/^(activate|deactivate|loop|end|note\s+)/i.test(line)) {
        processMessage(line)
      }
    })

  return { nodes, edges }
}

function parseClassRelation(line: string): { left: string; symbol: string; right: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : undefined
  const relationPart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  const parts = relationPart.split(/\s+/)
  if (parts.length < 3) {
    return undefined
  }
  return {
    left: sanitizeIdentifier(parts[0]!),
    symbol: parts[1]!,
    right: sanitizeIdentifier(parts[2]!),
    label,
  }
}

function mapClassRelationSymbol(symbol: string): {
  template: string
  styleOverrides?: EdgeStyleOverrides
  direction: 'forward' | 'reverse'
} {
  const relation = symbol.trim()
  const overrides: EdgeStyleOverrides = {}
  if (relation.includes('..')) {
    overrides.strokeStyle = 'dotted'
  } else if (relation.includes('--')) {
    overrides.strokeStyle = 'dashed'
  }
  let template = 'association'
  if (relation.includes('<|') || relation.includes('|>')) {
    template = 'inheritance'
  } else if (relation.includes('*')) {
    template = 'composition'
  } else if (relation.includes('o')) {
    template = 'aggregation'
  } else if (relation.includes('..')) {
    template = 'dependency'
  }
  const direction: 'forward' | 'reverse' = relation.startsWith('<') ? 'reverse' : 'forward'
  return { template, styleOverrides: Object.keys(overrides).length ? overrides : undefined, direction }
}

function convertClassDiagram(source: string): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []

  const ensureClassNode = (name: string) => ensureUniqueNode(nodes, name, name)

  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length && !line.startsWith('%%') && !/^classDiagram/i.test(line))
    .forEach((line) => {
      const relation = parseClassRelation(line)
      if (relation) {
        ensureClassNode(relation.left)
        ensureClassNode(relation.right)
        const mapping = mapClassRelationSymbol(relation.symbol)
        const from = mapping.direction === 'forward' ? relation.left : relation.right
        const to = mapping.direction === 'forward' ? relation.right : relation.left
        edges.push({
          from,
          to,
          label: relation.label,
          metadata: {
            template: mapping.template,
            styleOverrides: mapping.styleOverrides,
          },
        })
        return
      }

      if (/^class\s+/i.test(line)) {
        const name = sanitizeIdentifier(line.replace(/^class\s+/i, '').split(/[\s{]/)[0] ?? '')
        if (name) {
          ensureClassNode(name)
        }
        return
      }

      const propertyMatch = line.match(/^([^\s:]+)\s*:/)
      if (propertyMatch) {
        ensureClassNode(sanitizeIdentifier(propertyMatch[1]!))
      }
    })

  return { nodes, edges }
}

function extractLinkStyles(source: string): Map<number, EdgeStyleOverrides> {
  const overrides = new Map<number, EdgeStyleOverrides>()
  let defaultStyle: EdgeStyleOverrides | undefined
  const pattern = /linkStyle\s+(default|\d+)\s+([^\n]+)/gi
  for (const match of source.matchAll(pattern)) {
    const target = match[1]
    if (!target) continue
    const rawDeclaration = match[2]
    if (!rawDeclaration) continue
    const normalized = rawDeclaration.trim().replace(/,/g, ';')
    const edge = {
      id: '',
      start: '',
      end: '',
      styles: [normalized],
      classes: [] as string[],
    } as RawEdge
    const style = parseEdgeStyles(edge)
    if (!style) continue
    if (target === 'default') {
      defaultStyle = style
    } else {
      const index = Number.parseInt(target, 10)
      if (Number.isFinite(index)) {
        overrides.set(index, style)
      }
    }
  }
  if (defaultStyle) {
    overrides.set(-1, defaultStyle)
  }
  return overrides
}

function toNode(vertex: RawVertex): NodeData {
  const metadata: Record<string, unknown> = {}
  if (vertex.classes?.length) {
    metadata.classes = [...vertex.classes]
  }
  if (vertex.styles?.length) {
    metadata.styles = [...vertex.styles]
  }
  if (vertex.type) {
    metadata.mermaidType = vertex.type
  }
  if (vertex.shape) {
    metadata.mermaidShape = vertex.shape
  }
  if (vertex.domId) {
    metadata.domId = vertex.domId
  }
  if (vertex.props && Object.keys(vertex.props).length) {
    metadata.props = { ...vertex.props }
  }
  const styleOverrides = parseNodeStyles(vertex)
  if (styleOverrides) {
    metadata.styleOverrides = styleOverrides
  }
  const shape = mapShape(vertex.shape)
  if (shape) {
    metadata.shape = shape
  }
  const template = mapNodeClassesToTemplate(vertex.classes)
  return {
    id: vertex.id,
    label: normaliseLabel(vertex.text, vertex.id),
    type: template ?? 'MermaidNode',
    metadata: Object.keys(metadata).length ? metadata : undefined,
  }
}

function toEdge(edge: RawEdge): EdgeData {
  const metadata: Record<string, unknown> = { template: 'default', domId: edge.id }
  if (edge.classes?.length) {
    metadata.classes = [...edge.classes]
  }
  if (edge.type) {
    metadata.mermaidType = edge.type
  }
  if (edge.interpolate) {
    metadata.interpolate = edge.interpolate
  }
  if (edge.stroke) {
    metadata.stroke = edge.stroke
  }
  const styleOverrides = parseEdgeStyles(edge)
  if (styleOverrides) {
    metadata.styleOverrides = styleOverrides
  }
  const template = mapEdgeClassesToTemplate(edge.classes)
  if (template) {
    metadata.template = template
  }
  return {
    from: edge.start,
    to: edge.end,
    label: edge.text && edge.text.trim().length ? edge.text.trim() : undefined,
    metadata,
  }
}

function getFlowchartDb(diagram: unknown): FlowchartDb {
  if (!diagram || typeof diagram !== 'object') {
    return {}
  }
  const db = (diagram as { db?: unknown }).db
  return db && typeof db === 'object' ? (db as FlowchartDb) : {}
}

/**
 * Convert a Mermaid diagram string into the internal GraphData structure.
 *
 * Currently supports `flowchart`/`flowchart-v2` diagrams which map cleanly to
 * nodes and edges. Sequence, class, or other diagram types are rejected with a
 * descriptive error.
 */
export async function convertMermaidToGraph(
  source: string,
  options: MermaidConversionOptions = {},
): Promise<GraphData> {
  const trimmed = source.trim()
  if (!trimmed) {
    throw new MermaidConversionError('Mermaid definition is empty')
  }
  if (/^sequenceDiagram/i.test(trimmed)) {
    return convertSequenceDiagram(trimmed)
  }
  if (/^classDiagram/i.test(trimmed)) {
    return convertClassDiagram(trimmed)
  }
  try {
    ensureMermaidInitialized(options.config)
    const parseResult = await mermaid.mermaidAPI.parse(trimmed, { suppressErrors: false })
    const type = parseResult.diagramType
    if (!SUPPORTED_TYPES.has(type)) {
      throw new MermaidConversionError(
        `Unsupported Mermaid diagram type: ${type}. Only flowchart diagrams are supported at this time.`,
      )
    }
    if (options.expectedType && options.expectedType !== type) {
      throw new MermaidConversionError(
        `Expected Mermaid diagram type ${options.expectedType} but received ${type}.`,
      )
    }
    const diagram = await mermaid.mermaidAPI.getDiagramFromText(trimmed)
    const db = getFlowchartDb(diagram)
    const vertices = db.getVertices?.()
    const edges = db.getEdges?.()
    if (!vertices || !(vertices instanceof Map)) {
      throw new MermaidConversionError('Mermaid diagram did not expose vertex data')
    }
    const nodeList = Array.from(vertices.values()).map((vertex) => toNode(vertex))
    if (!nodeList.length) {
      throw new MermaidConversionError('Mermaid diagram has no nodes to render')
    }
    const linkStyles = extractLinkStyles(trimmed)
    const defaultLinkStyle = linkStyles.get(-1)
    const edgeList = Array.isArray(edges)
      ? edges.map((edge, index) => {
          const converted = toEdge(edge)
          const style = linkStyles.get(index) ?? defaultLinkStyle
          if (style) {
            const meta = (converted.metadata ?? {}) as { styleOverrides?: EdgeStyleOverrides }
            converted.metadata = {
              ...converted.metadata,
              styleOverrides: {
                ...(meta.styleOverrides ?? {}),
                ...style,
              },
            }
          }
          return converted
        })
      : []
    return {
      nodes: nodeList,
      edges: edgeList,
    }
  } catch (error) {
    if (error instanceof MermaidConversionError) {
      throw error
    }
    throw new MermaidConversionError('Failed to convert Mermaid diagram', error)
  }
}
