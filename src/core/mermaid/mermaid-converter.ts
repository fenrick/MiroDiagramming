import mermaid from 'mermaid'

import type { EdgeData, GraphData, NodeData } from '../graph/graph-service'

import { ensureMermaidInitialized } from './config'
import { isExperimentalShapesEnabled } from './feature-flags'
import { mapEdgeClassesToTemplate, mapNodeClassesToTemplate } from './template-map'
import {
  isSafeClassName,
  isSafeCssProperty,
  isSafeLookupKey,
  sanitizeObjectKey,
} from '../utils/object-safety'

export class MermaidConversionError extends Error {
  public constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'MermaidConversionError'
  }
}

interface MermaidLegacyParseOptions {
  suppressErrors?: boolean
  [key: string]: unknown
}

interface MermaidLegacyApi {
  parse: (text: string, options?: MermaidLegacyParseOptions) => Promise<{ diagramType: string }>
  getDiagramFromText: (text: string) => Promise<unknown>
}

let cachedLegacyApi: MermaidLegacyApi | undefined

function getLegacyMermaidApi(): MermaidLegacyApi {
  if (!cachedLegacyApi) {
    const api = (mermaid as unknown as { mermaidAPI?: MermaidLegacyApi }).mermaidAPI
    if (!api) {
      throw new MermaidConversionError('Mermaid legacy API unavailable')
    }
    cachedLegacyApi = api
  }
  return cachedLegacyApi
}

export interface MermaidConversionOptions {
  /** Optional override for mermaid configuration. */
  config?: Parameters<typeof mermaid.initialize>[0]
  /** Explicit diagram type guard; inferred automatically when omitted. */
  expectedType?: 'flowchart' | 'flowchart-v2'
}

interface RawVertex {
  id: string
  text?: string
  type?: string
  shape?: string
  classes?: string[]
  styles?: string[]
  domId?: string
  props?: Record<string, unknown>
}

interface RawEdge {
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

interface FlowchartDatabase {
  getVertices?: () => Map<string, RawVertex> | undefined
  getEdges?: () => RawEdge[] | undefined
}

const SUPPORTED_TYPES = new Set(['flowchart', 'flowchart-v2'])

const SHAPE_MAP = new Map<string, string>([
  ['rect', 'rectangle'],
  ['rectangle', 'rectangle'],
  ['square', 'rectangle'],
  ['round_rect', 'round_rectangle'],
  ['stadium', 'round_rectangle'],
  ['circle', 'circle'],
  ['diamond', 'rhombus'],
  ['rhombus', 'rhombus'],
  ['hexagon', 'hexagon'],
  ['parallelogram', 'parallelogram'],
  ['trapezoid', 'trapezoid'],
  ['subroutine', 'flow_chart_predefined_process'],
  ['predefined_process', 'flow_chart_predefined_process'],
  ['cylinder', 'can'],
  ['can', 'can'],
])

// Prefer experimental flowchart shapes when available and enabled.
const EXP_FLOWCHART_SHAPES = new Map<string, string>([
  // Restrict to shapes known to be accepted by the SDK
  ['rectangle', 'rectangle'],
  ['round_rectangle', 'round_rectangle'],
])

function safeLookup<V>(
  source: ReadonlyMap<string, V>,
  key: string,
  validator: (candidate: string) => boolean,
): V | undefined {
  const safeKey = sanitizeObjectKey(key, validator)
  return safeKey ? source.get(safeKey) : undefined
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

const EDGE_THICKNESS = new Map<string, number>([
  ['edge-thickness-thin', 1],
  ['edge-thickness-thick', 4],
  ['edge-thickness-invisible', 0],
])

const EDGE_PATTERN = new Map<string, 'dashed' | 'dotted'>([
  ['edge-pattern-dashed', 'dashed'],
  ['edge-pattern-dotted', 'dotted'],
])

type SubgraphDirectionCode = 'LR' | 'RL' | 'TB' | 'BT'
type CardinalDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface NodeStyleOverrides {
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  textColor?: string
}

interface EdgeStyleOverrides {
  strokeColor?: string
  strokeWidth?: number
  strokeStyle?: 'dashed' | 'dotted'
  color?: string
}

interface SequenceParticipant {
  id: string
  label: string
}

function decodeEntities(text: string): string {
  return text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function stripMarkdown(text: string): string {
  let t = text
  // Remove emphasis markers *...* and _..._
  t = t.replaceAll(/\*(.*?)\*/g, '$1').replaceAll(/_(.*?)_/g, '$1')
  // Remove inline code backticks
  t = t.replaceAll(/`+/g, '')
  // Collapse multiple spaces
  t = t.replaceAll(/[\t\f\v]+/g, ' ')
  return t
}

function normaliseLabel(candidate: string | undefined, fallback: string): string {
  if (typeof candidate !== 'string') {
    return fallback
  }
  const trimmed = candidate.trim()
  if (trimmed.length === 0) return fallback
  const decoded = decodeEntities(trimmed)
  return stripMarkdown(decoded)
}

function splitCssRules(entry?: string): string[] {
  if (!entry) {
    return []
  }
  return entry
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function normaliseCssRule(rule: string): [string, string] | undefined {
  const [rawProperty, rawValue] = rule.split(':')
  if (!rawProperty || rawValue === undefined) {
    return undefined
  }
  const property = sanitizeObjectKey(rawProperty.trim().toLowerCase(), isSafeCssProperty)
  const value = rawValue.trim()
  if (!property || !value) {
    return undefined
  }
  return [property, value]
}

function parseCssDeclarations(entries?: string[]): Record<string, string> {
  if (!entries?.length) {
    return {}
  }
  const declarations = new Map<string, string>()
  for (const entry of entries) {
    for (const rule of splitCssRules(entry)) {
      const parsed = normaliseCssRule(rule)
      if (!parsed) {
        continue
      }
      declarations.set(parsed[0], parsed[1])
    }
  }
  return Object.fromEntries(declarations)
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

interface ClassStyle {
  fill?: string
  stroke?: string
  color?: string
  ['stroke-dasharray']?: string
}

function extractClassDefinition(raw: string): { name: string; entries: string[] } | undefined {
  const line = raw.trim()
  if (!/^classDef\s+/i.test(line)) {
    return undefined
  }
  const rest = line.replace(/^classDef\s+/i, '')
  const [namePart, stylePart] = rest.split(/\s+/, 2)
  const name = namePart?.trim()
  const style = stylePart?.trim()
  if (!name || !style) {
    return undefined
  }
  const entries = style
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return entries.length > 0 ? { name, entries } : undefined
}

function applyClassStyleEntry(target: ClassStyle, entry: string): void {
  const [keyPart, valuePart] = entry.split(':')
  if (!keyPart || valuePart === undefined) {
    return
  }
  const key = keyPart.trim()
  const value = valuePart.trim()
  if (!key || !value) {
    return
  }
  switch (key) {
    case 'fill': {
      target.fill = value
      break
    }
    case 'stroke': {
      target.stroke = value
      break
    }
    case 'color': {
      target.color = value
      break
    }
    case 'stroke-dasharray': {
      target['stroke-dasharray'] = value
      break
    }
    default: {
      break
    }
  }
}

function parseClassDefs(source: string): Map<string, ClassStyle> {
  const map = new Map<string, ClassStyle>()
  for (const raw of source.split(/\r?\n/)) {
    const parsed = extractClassDefinition(raw)
    if (!parsed) {
      continue
    }
    const object: ClassStyle = {}
    for (const entry of parsed.entries) {
      applyClassStyleEntry(object, entry)
    }
    map.set(parsed.name, object)
  }
  return map
}

interface SubgraphContext {
  names: Set<string>
  membership: Map<string, string>
  directions: Map<string, SubgraphDirectionCode>
  parents: Map<string, string>
  stack: string[]
}

function createSubgraphContext(): SubgraphContext {
  return {
    names: new Set<string>(),
    membership: new Map<string, string>(),
    directions: new Map<string, SubgraphDirectionCode>(),
    parents: new Map<string, string>(),
    stack: [],
  }
}

function tryEnterSubgraph(context: SubgraphContext, line: string): boolean {
  const lineLower = line.toLowerCase()
  if (!lineLower.startsWith('subgraph ')) {
    return false
  }
  let name = line.slice('subgraph '.length).trim()
  const bracketIndex = name.indexOf('[')
  if (bracketIndex !== -1) {
    name = name.slice(0, bracketIndex).trim()
  }
  context.names.add(name)
  const parent = context.stack.at(-1)
  if (parent) {
    context.parents.set(name, parent)
  }
  context.stack.push(name)
  return true
}

function tryExitSubgraph(context: SubgraphContext, line: string): boolean {
  if (!/^end\b/i.test(line)) {
    return false
  }
  context.stack.pop()
  return true
}

function tryCaptureDirection(context: SubgraphContext, current: string, line: string): boolean {
  const directionMatch = /^direction\s+([A-Z]{2})\b/i.exec(line)
  const code = directionMatch?.[1]?.toUpperCase() as SubgraphDirectionCode | undefined
  if (code === 'LR' || code === 'RL' || code === 'TB' || code === 'BT') {
    context.directions.set(current, code)
    return true
  }
  return false
}

function registerSubgraphMembers(context: SubgraphContext, current: string, line: string): void {
  const tokenPattern = /\b[\w-]+\b/g
  for (const match of line.matchAll(tokenPattern)) {
    const rawToken = match[0]
    if (!rawToken) {
      continue
    }
    const id = sanitizeIdentifier(rawToken)
    if (
      /^(?:subgraph|end|flowchart|graph|classDiagram|stateDiagram|sequenceDiagram|erDiagram)$/i.test(
        id,
      )
    ) {
      continue
    }
    if (!context.membership.has(id)) {
      context.membership.set(id, current)
    }
  }
}

function processSubgraphLine(context: SubgraphContext, raw: string): void {
  const line = raw.trim()
  if (!line) {
    return
  }
  if (tryEnterSubgraph(context, line) || tryExitSubgraph(context, line)) {
    return
  }
  if (context.stack.length === 0) {
    return
  }
  const current = context.stack.at(-1)
  if (!current) {
    return
  }
  if (tryCaptureDirection(context, current, line)) {
    return
  }
  registerSubgraphMembers(context, current, line)
}

function parseSubgraphs(source: string): {
  names: Set<string>
  membership: Map<string, string>
  directions: Map<string, 'LR' | 'RL' | 'TB' | 'BT'>
  parents: Map<string, string>
} {
  const context = createSubgraphContext()
  for (const raw of source.split(/\r?\n/)) {
    processSubgraphLine(context, raw)
  }
  return {
    names: context.names,
    membership: context.membership,
    directions: context.directions,
    parents: context.parents,
  }
}

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function normaliseResolvedColor(value: string | undefined, fallback: string): string | undefined {
  if (!value) {
    return undefined
  }
  const lower = value.toLowerCase()
  if (lower === 'none' || lower === 'transparent') {
    return undefined
  }
  const resolved = resolveColor(lower, fallback)
  return HEX_COLOR_PATTERN.test(resolved) ? resolved : undefined
}

function parseNodeStyles(vertex: RawVertex): NodeStyleOverrides | undefined {
  const css = parseCssDeclarations(vertex.styles)
  const overrides: NodeStyleOverrides = {}
  const fill = normaliseResolvedColor(css.fill, colors.white)
  if (fill) {
    overrides.fillColor = fill
  }
  const stroke = normaliseResolvedColor(css.stroke, colors.black)
  if (stroke) {
    overrides.borderColor = stroke
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

function resolveStrokePattern(edge: RawEdge): 'dashed' | 'dotted' | undefined {
  if (edge.stroke === 'dashed' || edge.stroke === 'dotted') {
    return edge.stroke
  }
  return edge.classes?.map((cls) => safeLookup(EDGE_PATTERN, cls, isSafeClassName)).find(Boolean)
}

function resolveStrokeWidth(edge: RawEdge, css: Record<string, string>): number | undefined {
  const explicitWidth = parseLength(css['stroke-width'])
  if (explicitWidth !== undefined) {
    return explicitWidth
  }
  return edge.classes
    ?.map((cls) => safeLookup(EDGE_THICKNESS, cls, isSafeClassName))
    .find((value) => value !== undefined)
}

function parseEdgeStyles(edge: RawEdge): EdgeStyleOverrides | undefined {
  const css = parseCssDeclarations(edge.styles)
  const overrides: EdgeStyleOverrides = {}
  if (css.stroke) {
    overrides.strokeColor = css.stroke
  }
  const strokeWidth = resolveStrokeWidth(edge, css)
  if (strokeWidth !== undefined) {
    overrides.strokeWidth = strokeWidth
  }
  if (css.color) {
    overrides.color = css.color
  }
  const strokePattern = resolveStrokePattern(edge)
  if (strokePattern) {
    overrides.strokeStyle = strokePattern
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined
}

function mapShape(shape?: string): string | undefined {
  if (!shape) {
    return undefined
  }
  const key = shape.toLowerCase()
  const base = safeLookup(SHAPE_MAP, key, isSafeLookupKey)
  if (!base) {
    return undefined
  }
  const candidate = isExperimentalShapesEnabled()
    ? (safeLookup(EXP_FLOWCHART_SHAPES, base, isSafeLookupKey) ?? base)
    : base
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
  type = 'MermaidNode',
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

function stripSequenceSuffix(value: string): string {
  return value.endsWith('+') || value.endsWith('-') ? value.slice(0, -1) : value
}

function stripSequencePrefix(value: string): string {
  return value.startsWith('+') || value.startsWith('-') ? value.slice(1) : value
}

function normaliseSequenceEndpoint(segment: string, direction: 'from' | 'to'): string | undefined {
  const trimmedSegment =
    direction === 'from' ? stripSequenceSuffix(segment) : stripSequencePrefix(segment)
  const trimmed = trimmedSegment.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function splitSequenceMessage(
  messagePart: string,
): { from: string; to: string; arrow: string } | undefined {
  for (const arrow of SEQUENCE_ARROWS) {
    const index = messagePart.indexOf(arrow)
    if (index <= 0) {
      continue
    }
    const from = normaliseSequenceEndpoint(messagePart.slice(0, index), 'from')
    const to = normaliseSequenceEndpoint(messagePart.slice(index + arrow.length), 'to')
    if (!from || !to) {
      continue
    }
    return { from, to, arrow }
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

interface SequenceContext {
  participants: Map<string, SequenceParticipant>
  nodes: NodeData[]
  edges: EdgeData[]
}

function createSequenceContext(): SequenceContext {
  return {
    participants: new Map<string, SequenceParticipant>(),
    nodes: [],
    edges: [],
  }
}

function iterateSequenceLines(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%%') && !/^sequenceDiagram/i.test(line))
}

function ensureSequenceParticipant(context: SequenceContext, id: string, label: string): void {
  if (context.participants.has(id)) {
    return
  }
  context.participants.set(id, { id, label })
  ensureUniqueNode(context.nodes, id, label, 'MermaidActor')
}

function handleSequenceParticipant(context: SequenceContext, line: string): boolean {
  if (!/^(?:participant|actor)\s+/i.test(line)) {
    return false
  }
  const participant = parseParticipantLine(line)
  if (participant) {
    ensureSequenceParticipant(context, participant.id, participant.label)
  }
  return true
}

function handleSequenceMessage(context: SequenceContext, line: string): void {
  if (/^(?:activate|deactivate|loop|end|note\s+)/i.test(line)) {
    return
  }
  const message = parseMessageLine(line)
  if (!message) {
    return
  }
  ensureSequenceParticipant(context, message.from, message.from)
  ensureSequenceParticipant(context, message.to, message.to)
  const arrowMeta = mapSequenceArrow(message.arrow)
  context.edges.push({
    from: message.from,
    to: message.to,
    label: message.label,
    metadata: {
      template: arrowMeta.template,
      styleOverrides: arrowMeta.styleOverrides,
    },
  })
}

function convertSequenceDiagram(source: string): GraphData {
  const context = createSequenceContext()
  for (const line of iterateSequenceLines(source)) {
    if (handleSequenceParticipant(context, line)) {
      continue
    }
    handleSequenceMessage(context, line)
  }
  return { nodes: context.nodes, edges: context.edges }
}

const STATE_TRANSITION_PATTERNS = ['-->', '->']

function splitStateLine(line: string): { relation: string; label?: string } {
  const colonIndex = line.indexOf(':')
  if (colonIndex === -1) {
    return { relation: line.trim() }
  }
  const relation = line.slice(0, colonIndex).trim()
  const label = line.slice(colonIndex + 1).trim()
  return { relation, label: label.length > 0 ? label : undefined }
}

function mapStateTransition(
  relation: string,
  pattern: string,
  label?: string,
): { from: string; to: string; label?: string } | undefined {
  const index = relation.indexOf(pattern)
  if (index <= 0) {
    return undefined
  }
  const from = sanitizeIdentifier(relation.slice(0, index).trim())
  const to = sanitizeIdentifier(relation.slice(index + pattern.length).trim())
  if (!from || !to) {
    return undefined
  }
  return { from, to, label }
}

function parseStateTransition(
  line: string,
): { from: string; to: string; label?: string } | undefined {
  const { relation, label } = splitStateLine(line)
  return STATE_TRANSITION_PATTERNS.map((pattern) =>
    mapStateTransition(relation, pattern, label),
  ).find(Boolean)
}

function collectStateDiagramLines(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%%') && !/^stateDiagram/i.test(line))
}

function createStateEnsurer(nodes: NodeData[], states: Set<string>) {
  return (id: string, label: string) => {
    if (id === '[*]' || states.has(id)) {
      return
    }
    states.add(id)
    ensureUniqueNode(nodes, id, label, 'MermaidState')
  }
}

function extractStateDeclaration(line: string): { id: string; label: string } | undefined {
  if (!/^state\s+/i.test(line)) {
    return undefined
  }
  const cleaned = line.replace(/^state\s+/i, '')
  const lower = cleaned.toLowerCase()
  const asIndex = lower.indexOf(' as ')
  const rawName = asIndex === -1 ? cleaned : cleaned.slice(0, asIndex)
  const alias = asIndex === -1 ? rawName : cleaned.slice(asIndex + 4)
  const id = sanitizeIdentifier(alias.split(/[\s{]/)[0] ?? '')
  if (!id) {
    return undefined
  }
  return { id, label: sanitizeIdentifier(rawName) }
}

function registerStateDeclarations(
  lines: string[],
  ensureState: (id: string, label: string) => void,
) {
  for (const line of lines) {
    const declaration = extractStateDeclaration(line)
    if (declaration) {
      ensureState(declaration.id, declaration.label)
    }
  }
}

function appendStateTransitions(
  lines: string[],
  ensureState: (id: string, label: string) => void,
  edges: EdgeData[],
) {
  for (const line of lines) {
    const transition = parseStateTransition(line)
    if (!transition) {
      continue
    }
    ensureState(transition.from, transition.from)
    ensureState(transition.to, transition.to)
    if (transition.from === '[*]' || transition.to === '[*]') {
      continue
    }
    edges.push({
      from: transition.from,
      to: transition.to,
      label: transition.label,
      metadata: { template: 'flow' },
    })
  }
}

function convertStateDiagram(source: string): GraphData {
  const nodes: NodeData[] = []
  const edges: EdgeData[] = []
  const states = new Set<string>()
  const lines = collectStateDiagramLines(source)
  const ensureState = createStateEnsurer(nodes, states)
  registerStateDeclarations(lines, ensureState)
  appendStateTransitions(lines, ensureState, edges)
  return { nodes, edges }
}

function parseErRelation(
  line: string,
): { left: string; symbol: string; right: string; label?: string } | undefined {
  const colonIndex = line.indexOf(':')
  const label = colonIndex === -1 ? undefined : line.slice(colonIndex + 1).trim()
  const relationPart = colonIndex >= 0 ? line.slice(0, colonIndex).trim() : line.trim()
  // Support plain identifiers (\w+) or quoted names with spaces.
  const match = /^("[^"]+"|\w+)\s+([|}{o]{1,2}--[|}{o]{1,2})\s+("[^"]+"|\w+)/.exec(relationPart)
  if (!match) {
    return undefined
  }
  const [, leftRaw, symbol, rightRaw] = match
  if (!leftRaw || !symbol || !rightRaw) {
    return undefined
  }
  return {
    left: sanitizeIdentifier(leftRaw),
    symbol,
    right: sanitizeIdentifier(rightRaw),
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

  const ensureEntity = (name: string) => {
    ensureUniqueNode(nodes, name, name, 'MermaidEntity')
  }

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
  const [left, symbol, right] = parts
  if (!left || !symbol || !right) {
    return undefined
  }
  return {
    left: sanitizeIdentifier(left),
    symbol,
    right: sanitizeIdentifier(right),
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

  const ensureClassNode = (name: string) => {
    ensureUniqueNode(nodes, name, name, 'MermaidClass')
  }

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
    const propertyMatch = /^([^\s:]+)\s*:/.exec(line)
    const className = propertyMatch?.[1]
    if (className) {
      ensureClassNode(sanitizeIdentifier(className))
    }
  }

  for (const line of lines) {
    if (!handleRelation(line)) {
      handleDeclarationOrProperty(line)
    }
  }

  return { nodes, edges }
}

function normaliseLinkStyleMatch(match: RegExpMatchArray):
  | {
      target: number | 'default'
      style?: EdgeStyleOverrides
    }
  | undefined {
  const target = match[1]
  const rawDeclaration = match[2]
  if (!target || !rawDeclaration) {
    return undefined
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
    return undefined
  }
  if (target === 'default') {
    return { target: 'default', style }
  }
  const index = Number.parseInt(target, 10)
  return Number.isFinite(index) ? { target: index, style } : undefined
}

function extractLinkStyles(source: string): Map<number, EdgeStyleOverrides> {
  const overrides = new Map<number, EdgeStyleOverrides>()
  let defaultStyle: EdgeStyleOverrides | undefined
  const pattern = /linkStyle\s+(default|\d+)\s+([^\n]+)/gi
  for (const match of source.matchAll(pattern)) {
    const parsed = normaliseLinkStyleMatch(match)
    if (!parsed?.style) {
      continue
    }
    if (parsed.target === 'default') {
      defaultStyle = parsed.style
    } else {
      overrides.set(parsed.target, parsed.style)
    }
  }
  if (defaultStyle) {
    overrides.set(-1, defaultStyle)
  }
  return overrides
}

function cloneIfNonEmptyArray<T>(value?: T[]): T[] | undefined {
  return value && value.length > 0 ? [...value] : undefined
}

function cloneIfNonEmptyObject(
  value?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!value) {
    return undefined
  }
  return Object.keys(value).length > 0 ? { ...value } : undefined
}

function assignArrayMetadata(
  metadata: Record<string, unknown>,
  key: 'classes' | 'styles',
  value?: string[],
): void {
  const clone = cloneIfNonEmptyArray(value)
  if (!clone) {
    return
  }
  if (key === 'classes') {
    metadata.classes = clone
    return
  }
  metadata.styles = clone
}

function assignPropertiesMetadata(
  metadata: Record<string, unknown>,
  value?: Record<string, unknown>,
): void {
  const clone = cloneIfNonEmptyObject(value)
  if (clone) {
    metadata.props = clone
  }
}

function assignStringMetadata(
  metadata: Record<string, unknown>,
  key: 'mermaidType' | 'mermaidShape' | 'domId',
  value: string | undefined,
): void {
  if (!value) {
    return
  }
  switch (key) {
    case 'mermaidType': {
      metadata.mermaidType = value
      break
    }
    case 'mermaidShape': {
      metadata.mermaidShape = value
      break
    }
    case 'domId': {
      metadata.domId = value
      break
    }
  }
}

function buildNodeMetadata(vertex: RawVertex): Record<string, unknown> | undefined {
  const metadata: Record<string, unknown> = {}
  assignArrayMetadata(metadata, 'classes', vertex.classes)
  assignArrayMetadata(metadata, 'styles', vertex.styles)
  assignPropertiesMetadata(metadata, vertex.props)
  assignStringMetadata(metadata, 'mermaidType', vertex.type)
  assignStringMetadata(metadata, 'mermaidShape', vertex.shape)
  assignStringMetadata(metadata, 'domId', vertex.domId)
  const styleOverrides = parseNodeStyles(vertex)
  if (styleOverrides) {
    metadata.styleOverrides = styleOverrides
  }
  const shape = mapShape(vertex.shape ?? vertex.type)
  if (shape) {
    metadata.shape = shape
  }
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

function toNode(vertex: RawVertex): NodeData {
  const template = mapNodeClassesToTemplate(vertex.classes)
  return {
    id: vertex.id,
    label: normaliseLabel(vertex.text, vertex.id),
    type: template ?? 'MermaidNode',
    metadata: buildNodeMetadata(vertex),
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

type DiagramKeyword = 'sequence' | 'class' | 'state' | 'er'

function detectDiagramKeyword(trimmed: string): DiagramKeyword | undefined {
  if (/^sequenceDiagram/i.test(trimmed)) {
    return 'sequence'
  }
  if (/^classDiagram/i.test(trimmed)) {
    return 'class'
  }
  if (/^stateDiagram/i.test(trimmed)) {
    return 'state'
  }
  if (/^erDiagram/i.test(trimmed)) {
    return 'er'
  }
  return undefined
}

function convertKeywordDiagram(keyword: DiagramKeyword, trimmed: string): GraphData {
  switch (keyword) {
    case 'sequence': {
      return convertSequenceDiagram(trimmed)
    }
    case 'class': {
      return convertClassDiagram(trimmed)
    }
    case 'state': {
      return convertStateDiagram(trimmed)
    }
    case 'er': {
      return convertErDiagram(trimmed)
    }
    default: {
      return { nodes: [], edges: [] }
    }
  }
}

function assertFlowchartType(type: string, expected?: 'flowchart' | 'flowchart-v2'): void {
  if (!SUPPORTED_TYPES.has(type)) {
    throw new MermaidConversionError(
      `Unsupported Mermaid diagram type: ${type}. Only flowchart diagrams are supported at this time.`,
    )
  }
  if (expected && expected !== type) {
    throw new MermaidConversionError(
      `Expected Mermaid diagram type ${expected} but received ${type}.`,
    )
  }
}

async function prepareFlowchartDatabase(
  trimmed: string,
  options: MermaidConversionOptions,
): Promise<FlowchartDatabase> {
  ensureMermaidInitialized(options.config)
  const legacyApi = getLegacyMermaidApi()
  const parseResult = await legacyApi.parse(trimmed, { suppressErrors: false })
  assertFlowchartType(parseResult.diagramType, options.expectedType)
  const diagram = await legacyApi.getDiagramFromText(trimmed)
  return getFlowchartDatabase(diagram)
}

function extractFlowchartElements(database: FlowchartDatabase): {
  vertices: Map<string, RawVertex>
  edges: RawEdge[] | undefined
} {
  const vertices = database.getVertices?.()
  if (!vertices || !(vertices instanceof Map)) {
    throw new MermaidConversionError('Mermaid diagram did not expose vertex data')
  }
  return { vertices, edges: database.getEdges?.() }
}

function buildNodesFromVertices(vertices: Map<string, RawVertex>): NodeData[] {
  return [...vertices.values()].map((vertex) => toNode(vertex))
}

function applyClassDefinition(target: NodeStyleOverrides, definition: ClassStyle): void {
  const fill = normaliseResolvedColor(definition.fill, colors.white)
  if (fill) {
    target.fillColor = fill
  }
  const stroke = normaliseResolvedColor(definition.stroke, colors.black)
  if (stroke) {
    target.borderColor = stroke
  }
  if (definition.color) {
    target.textColor = definition.color
  }
}

function mergeClassDefinitions(
  classNames: string[],
  classDefs: Map<string, ClassStyle>,
): NodeStyleOverrides | undefined {
  if (classNames.length === 0) {
    return undefined
  }
  const merged: NodeStyleOverrides = {}
  for (const className of classNames) {
    const definition = classDefs.get(className)
    if (definition) {
      applyClassDefinition(merged, definition)
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined
}

function applyClassDefinitionsToNodes(nodes: NodeData[], classDefs: Map<string, ClassStyle>): void {
  if (classDefs.size === 0) {
    return
  }
  for (const node of nodes) {
    const classes = (node.metadata as { classes?: string[] } | undefined)?.classes ?? []
    const overrides = mergeClassDefinitions(classes, classDefs)
    if (!overrides) {
      continue
    }
    const existing = (node.metadata as { styleOverrides?: NodeStyleOverrides } | undefined)
      ?.styleOverrides
    node.metadata = {
      ...node.metadata,
      styleOverrides: { ...existing, ...overrides },
    }
  }
}

function annotateSubgraphMembership(
  nodes: NodeData[],
  subgraphMap: ReturnType<typeof parseSubgraphs>,
): void {
  for (const node of nodes) {
    const parent = subgraphMap.membership.get(node.id)
    if (!parent) {
      continue
    }
    node.metadata = { ...node.metadata, parent }
  }
}

function mapSubgraphDirection(
  code: 'LR' | 'RL' | 'TB' | 'BT' | undefined,
): CardinalDirection | undefined {
  switch (code) {
    case 'LR': {
      return 'RIGHT'
    }
    case 'RL': {
      return 'LEFT'
    }
    case 'TB': {
      return 'DOWN'
    }
    case 'BT': {
      return 'UP'
    }
    default: {
      return undefined
    }
  }
}

function buildSubgraphMetadata(
  name: string,
  subgraphMap: ReturnType<typeof parseSubgraphs>,
): Record<string, unknown> {
  const direction = mapSubgraphDirection(subgraphMap.directions.get(name))
  const metadata: Record<string, unknown> = { isSubgraph: true }
  if (direction) {
    metadata.subgraphDirection = direction
  }
  const parent = subgraphMap.parents.get(name)
  if (parent) {
    metadata.parent = parent
  }
  return metadata
}

function addSubgraphContainers(
  nodes: NodeData[],
  subgraphMap: ReturnType<typeof parseSubgraphs>,
): void {
  const index = new Map(nodes.map((node) => [node.id, node]))
  for (const name of subgraphMap.names) {
    const metadata = buildSubgraphMetadata(name, subgraphMap)
    const existing = index.get(name)
    if (existing) {
      existing.metadata = { ...existing.metadata, ...metadata }
      continue
    }
    const newNode: NodeData = { id: name, label: name, type: 'Composite', metadata }
    nodes.push(newNode)
    index.set(name, newNode)
  }
}

function applyEdgeStyleOverride(edge: EdgeData, style: EdgeStyleOverrides | undefined): EdgeData {
  if (!style) {
    return edge
  }
  const existing = (edge.metadata as { styleOverrides?: EdgeStyleOverrides } | undefined)
    ?.styleOverrides
  edge.metadata = {
    ...edge.metadata,
    styleOverrides: { ...existing, ...style },
  }
  return edge
}

function buildEdgeList(edges: RawEdge[] | undefined, source: string): EdgeData[] {
  if (!Array.isArray(edges)) {
    return []
  }
  const linkStyles = extractLinkStyles(source)
  const defaultStyle = linkStyles.get(-1)
  return edges.map((edge, index) => {
    const converted = toEdge(edge)
    const style = linkStyles.get(index) ?? defaultStyle
    return applyEdgeStyleOverride(converted, style)
  })
}

async function convertFlowchartDiagram(
  trimmed: string,
  classDefs: Map<string, ClassStyle>,
  subgraphMap: ReturnType<typeof parseSubgraphs>,
  options: MermaidConversionOptions,
): Promise<GraphData> {
  const database = await prepareFlowchartDatabase(trimmed, options)
  const { vertices, edges } = extractFlowchartElements(database)
  const nodes = buildNodesFromVertices(vertices)
  applyClassDefinitionsToNodes(nodes, classDefs)
  annotateSubgraphMembership(nodes, subgraphMap)
  addSubgraphContainers(nodes, subgraphMap)
  if (nodes.length === 0) {
    throw new MermaidConversionError('Mermaid diagram has no nodes to render')
  }
  const edgeList = buildEdgeList(edges, trimmed)
  return { nodes, edges: edgeList }
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
  const keyword = detectDiagramKeyword(trimmed)
  if (keyword) {
    return convertKeywordDiagram(keyword, trimmed)
  }
  const subgraphMap = parseSubgraphs(source)
  const classDefs = parseClassDefs(source)
  try {
    return await convertFlowchartDiagram(trimmed, classDefs, subgraphMap, options)
  } catch (error) {
    if (error instanceof MermaidConversionError) {
      throw error
    }
    throw new MermaidConversionError('Failed to convert Mermaid diagram', error)
  }
}

/**
 * Internal helpers exposed for unit testing so complex parsing branches can be
 * validated directly without relying on Mermaid's runtime behaviour. The
 * object shape is deliberately simple to avoid accidental production usage.
 */
export const __testables = {
  parseCssDeclarations,
  parseClassDefs,
  parseSubgraphs,
  parseNodeStyles,
  parseEdgeStyles,
  splitSequenceMessage,
  parseMessageLine,
  mapSequenceArrow,
  convertSequenceDiagram,
  parseStateTransition,
  convertStateDiagram,
  parseErRelation,
  formatErCardinality,
  convertErDiagram,
  parseClassRelation,
  mapClassRelationSymbol,
  convertClassDiagram,
  extractLinkStyles,
  toNode,
  toEdge,
} as const
