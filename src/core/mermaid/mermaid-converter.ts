import mermaid from 'mermaid'

import type { EdgeData, GraphData, NodeData } from '../graph/graph-service'

import { ensureMermaidInitialized } from './config'
import { isExperimentalShapesEnabled } from './feature-flags'
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

type FlowchartDatabase = {
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
  diamond: 'rhombus',
  rhombus: 'rhombus',
  hexagon: 'hexagon',
  parallelogram: 'parallelogram',
  trapezoid: 'trapezoid',
  subroutine: 'flow_chart_predefined_process',
  predefined_process: 'flow_chart_predefined_process',
  cylinder: 'can',
  can: 'can',
}

// Prefer experimental flowchart shapes when available and enabled.
const EXP_FLOWCHART_SHAPES: Record<string, string> = {
  // Restrict to shapes known to be accepted by the SDK
  rectangle: 'rectangle',
  round_rectangle: 'round_rectangle',
}
const ALLOWED_SHAPES = new Set([
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
])

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
  return trimmed.length > 0 ? trimmed : fallback
}

function parseCssDeclarations(entries?: string[]): Record<string, string> {
  const declarations: Record<string, string> = {}
  if (!entries) {
    return declarations
  }
  for (const entry of entries) {
    if (!entry) {
      continue
    }
    const rules = entry
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean)
    for (const rule of rules) {
      const [rawProperty, rawValue] = rule.split(':')
      if (!rawProperty || rawValue === undefined) {
        continue
      }
      const property = rawProperty.trim().toLowerCase()
      const value = rawValue.trim()
      if (!value) {
        continue
      }
      declarations[property] = value
    }
  }
  return declarations
}

function parseLength(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }
  const numeric = Number.parseFloat(value.replace(/px$/i, ''))
  return Number.isFinite(numeric) ? numeric : undefined
}

import { resolveColor } from '../utils/color-utilities'
import { colors } from '@mirohq/design-tokens'

function parseNodeStyles(vertex: RawVertex): NodeStyleOverrides | undefined {
  const css = parseCssDeclarations(vertex.styles)
  const overrides: NodeStyleOverrides = {}
  if (css.fill) {
    const value = css.fill.toLowerCase()
    if (value !== 'none' && value !== 'transparent') {
      overrides.fillColor = resolveColor(value, colors.white)
    }
  }
  if (css.stroke) {
    const value = css.stroke.toLowerCase()
    if (value !== 'none' && value !== 'transparent') {
      overrides.borderColor = resolveColor(value, colors.black)
    }
  }
  const borderWidth = parseLength(css['stroke-width'])
  if (borderWidth !== undefined) {
    overrides.borderWidth = borderWidth
  }
  if (css.color) {
    overrides.textColor = css.color
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined
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
  return Object.keys(overrides).length > 0 ? overrides : undefined
}

function mapShape(shape?: string): string | undefined {
  if (!shape) {
    return undefined
  }
  const key = shape.toLowerCase()
  const base = SHAPE_MAP[key]
  if (!base) {
    return undefined
  }
  const candidate =
    isExperimentalShapesEnabled() && EXP_FLOWCHART_SHAPES[base] ? EXP_FLOWCHART_SHAPES[base] : base
  return ALLOWED_SHAPES.has(candidate) ? candidate : 'rectangle'
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
  const existing = nodes.find((node) => node.id === id)
  if (existing) {
    if (!existing.label && label) {
      existing.label = label
    }
    if (type && existing.type === 'MermaidNode' && type !== existing.type) {
      existing.type = type
    }
    return
  }
  nodes.push({ id, label, type })
}

function parseParticipantLine(line: string): SequenceParticipant | undefined {
  const cleaned = line.replace(/^(?:participant|actor)\s+/i, '')
  const lower = cleaned.toLowerCase()
  const asIndex = lower.indexOf(' as ')
  let rawName = cleaned
  let rawAlias: string | undefined
  if (asIndex !== -1) {
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

const SEQUENCE_ARROWS = ['-->>', '->>', '..>>', '-->', '..>', '->', '--', '..', '-x', 'x-']

function splitSequenceMessage(
  messagePart: string,
): { from: string; to: string; arrow: string } | undefined {
  for (const arrow of SEQUENCE_ARROWS) {
    const index = messagePart.indexOf(arrow)
    if (index > 0) {
      let from = messagePart.slice(0, index).trim()
      let to = messagePart.slice(index + arrow.length).trim()
      if (!from || !to) {
        continue
      }

      if (from.endsWith('+') || from.endsWith('-')) {
        from = from.slice(0, -1)
      }
      if (to.startsWith('+') || to.startsWith('-')) {
        to = to.slice(1)
      }
      from = from.trim()
      to = to.trim()
      if (!from || !to) {
        continue
      }
      return { from, to, arrow }
    }
  }
  return undefined
}

function parseMessageLine(
  line: string,
): { from: string; to: string; arrow: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex === -1 ? undefined : line.slice(colonIndex + 1).trim()
  const messagePart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  const split = splitSequenceMessage(messagePart)
  return split ? { ...split, label: label?.length ? label : undefined } : undefined
}

function mapSequenceArrow(arrow: string): {
  template: string
  styleOverrides?: EdgeStyleOverrides
} {
  const overrides: EdgeStyleOverrides = {}
  if (arrow.includes('--')) {
    overrides.strokeStyle = 'dashed'
  }
  if (arrow.includes('..')) {
    overrides.strokeStyle = 'dotted'
  }
  return {
    template: arrow.includes('>>') ? 'flow' : 'default',
    styleOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
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
      ensureUniqueNode(nodes, participant.id, participant.label, 'MermaidActor')
    }
  }

  const processMessage = (line: string) => {
    const message = parseMessageLine(line)
    if (!message) {
      return
    }
    if (!participants.has(message.from)) {
      participants.set(message.from, { id: message.from, label: message.from })
      ensureUniqueNode(nodes, message.from, message.from, 'MermaidActor')
    }
    if (!participants.has(message.to)) {
      participants.set(message.to, { id: message.to, label: message.to })
      ensureUniqueNode(nodes, message.to, message.to, 'MermaidActor')
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

  for (const line of source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line.length > 0 && !line.startsWith('%%') && !/^sequenceDiagram/i.test(line),
    )) {
    if (/^(?:participant|actor)\s+/i.test(line)) {
      processParticipant(line)
    } else if (!/^(?:activate|deactivate|loop|end|note\s+)/i.test(line)) {
      processMessage(line)
    }
  }

  return { nodes, edges }
}

const STATE_TRANSITION_PATTERNS = ['-->', '->']

function parseStateTransition(
  line: string,
): { from: string; to: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex === -1 ? undefined : line.slice(colonIndex + 1).trim()
  const relationPart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  for (const pattern of STATE_TRANSITION_PATTERNS) {
    const index = relationPart.indexOf(pattern)
    if (index > 0) {
      const from = sanitizeIdentifier(relationPart.slice(0, index).trim())
      const to = sanitizeIdentifier(relationPart.slice(index + pattern.length).trim())
      if (from && to) {
        return { from, to, label: label?.length ? label : undefined }
      }
    }
  }
  return undefined
}

function convertStateDiagram(source: string): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []
  const states = new Set<string>()

  const ensureState = (id: string, label: string) => {
    if (id === '[*]') {
      return
    }
    if (!states.has(id)) {
      states.add(id)
      ensureUniqueNode(nodes, id, label, 'MermaidState')
    }
  }

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%%') && !/^stateDiagram/i.test(line))

  // Pass 1: register states via declarations
  for (const line of lines) {
    if (!/^state\s+/i.test(line)) continue
    const cleaned = line.replace(/^state\s+/i, '')
    const lower = cleaned.toLowerCase()
    const asIndex = lower.indexOf(' as ')
    const rawName = asIndex === -1 ? cleaned : cleaned.slice(0, asIndex)
    const alias = asIndex === -1 ? rawName : cleaned.slice(asIndex + 4)
    const id = sanitizeIdentifier((alias ?? rawName).split(/[\s{]/)[0] ?? '')
    if (id) {
      ensureState(id, sanitizeIdentifier(rawName))
    }
  }

  // Pass 2: transitions
  for (const line of lines) {
    const transition = parseStateTransition(line)
    if (!transition) continue
    ensureState(transition.from, transition.from)
    ensureState(transition.to, transition.to)
    if (transition.from !== '[*]' && transition.to !== '[*]') {
      edges.push({
        from: transition.from,
        to: transition.to,
        label: transition.label,
        metadata: { template: 'flow' },
      })
    }
  }

  return { nodes, edges }
}

function parseErRelation(
  line: string,
): { left: string; symbol: string; right: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex === -1 ? undefined : line.slice(colonIndex + 1).trim()
  const relationPart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  // Support plain identifiers (\w+) or quoted names with spaces.
  const match = relationPart.match(/^("[^"]+"|\w+)\s+([|}{o]{1,2}--[|}{o]{1,2})\s+("[^"]+"|\w+)/)
  if (!match) {
    return undefined
  }
  return {
    left: sanitizeIdentifier(match[1]!),
    symbol: match[2]!,
    right: sanitizeIdentifier(match[3]!),
    label,
  }
}

function formatErCardinality(symbol: string): string {
  const [left, right] = symbol.split('--')
  if (!left || !right) {
    return symbol
  }
  return `${left} .. ${right}`
}

function convertErDiagram(source: string): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []

  const ensureEntity = (name: string) => ensureUniqueNode(nodes, name, name, 'MermaidEntity')

  for (const line of source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%%') && !/^erDiagram/i.test(line))) {
    const relation = parseErRelation(line)
    if (!relation) {
      continue
    }
    ensureEntity(relation.left)
    ensureEntity(relation.right)
    const cardinality = formatErCardinality(relation.symbol)
    const label = relation.label ? `${relation.label} (${cardinality})` : cardinality
    edges.push({
      from: relation.left,
      to: relation.right,
      label,
      metadata: { template: 'association' },
    })
  }

  return { nodes, edges }
}

function parseClassRelation(
  line: string,
): { left: string; symbol: string; right: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex === -1 ? undefined : line.slice(colonIndex + 1).trim()
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
  // Mermaid class diagrams use '--' for solid and '..' for non-solid.
  // Only apply a non-solid override for '..' relations; leave '--' as solid.
  if (relation.includes('..')) {
    // Use dashed as the non-solid representation in Miro.
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
  return {
    template,
    styleOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    direction,
  }
}

function convertClassDiagram(source: string): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []

  const ensureClassNode = (name: string) => ensureUniqueNode(nodes, name, name, 'MermaidClass')

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%%') && !/^classDiagram/i.test(line))

  const handleRelation = (line: string): boolean => {
    const relation = parseClassRelation(line)
    if (!relation) return false
    ensureClassNode(relation.left)
    ensureClassNode(relation.right)
    const mapping = mapClassRelationSymbol(relation.symbol)
    const from = mapping.direction === 'forward' ? relation.left : relation.right
    const to = mapping.direction === 'forward' ? relation.right : relation.left
    edges.push({
      from,
      to,
      label: relation.label,
      metadata: { template: mapping.template, styleOverrides: mapping.styleOverrides },
    })
    return true
  }

  const handleDeclarationOrProperty = (line: string): void => {
    if (/^class\s+/i.test(line)) {
      const name = sanitizeIdentifier(line.replace(/^class\s+/i, '').split(/[\s{]/)[0] ?? '')
      if (name) ensureClassNode(name)
      return
    }
    const propertyMatch = line.match(/^([^\s:]+)\s*:/)
    if (propertyMatch) {
      ensureClassNode(sanitizeIdentifier(propertyMatch[1]!))
    }
  }

  for (const line of lines) {
    if (!handleRelation(line)) {
      handleDeclarationOrProperty(line)
    }
  }

  return { nodes, edges }
}

function extractLinkStyles(source: string): Map<number, EdgeStyleOverrides> {
  const overrides = new Map<number, EdgeStyleOverrides>()
  let defaultStyle: EdgeStyleOverrides | undefined
  const pattern = /linkStyle\s+(default|\d+)\s+([^\n]+)/gi
  for (const match of source.matchAll(pattern)) {
    const target = match[1]
    if (!target) {
      continue
    }
    const rawDeclaration = match[2]
    if (!rawDeclaration) {
      continue
    }
    const normalized = rawDeclaration.trim().replaceAll(',', ';')
    const edge = {
      id: '',
      start: '',
      end: '',
      styles: [normalized],
      classes: [] as string[],
    } as RawEdge
    const style = parseEdgeStyles(edge)
    if (!style) {
      continue
    }
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
  if (vertex.props && Object.keys(vertex.props).length > 0) {
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
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
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
    label: edge.text && edge.text.trim().length > 0 ? edge.text.trim() : undefined,
    metadata,
  }
}

function getFlowchartDatabase(diagram: unknown): FlowchartDatabase {
  if (!diagram || typeof diagram !== 'object') {
    return {}
  }
  const database = (diagram as { db?: unknown }).db
  return database && typeof database === 'object' ? (database as FlowchartDatabase) : {}
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
  if (/^stateDiagram/i.test(trimmed)) {
    return convertStateDiagram(trimmed)
  }
  if (/^erDiagram/i.test(trimmed)) {
    return convertErDiagram(trimmed)
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
    const database = getFlowchartDatabase(diagram)
    const vertices = database.getVertices?.()
    const edges = database.getEdges?.()
    if (!vertices || !(vertices instanceof Map)) {
      throw new MermaidConversionError('Mermaid diagram did not expose vertex data')
    }
    const nodeList = [...vertices.values()].map((vertex) => toNode(vertex))
    if (nodeList.length === 0) {
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
                ...meta.styleOverrides,
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
