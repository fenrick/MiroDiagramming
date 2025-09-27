import mermaid from 'mermaid'

import type { EdgeData, GraphData, NodeData } from '../graph/graph-service'

import { ensureMermaidInitialized } from './config'

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
}

type FlowchartDb = {
  getVertices?: () => Map<string, RawVertex> | undefined
  getEdges?: () => RawEdge[] | undefined
}

const SUPPORTED_TYPES = new Set(['flowchart', 'flowchart-v2'])

function normaliseLabel(candidate: string | undefined, fallback: string): string {
  if (typeof candidate !== 'string') {
    return fallback
  }
  const trimmed = candidate.trim()
  return trimmed.length ? trimmed : fallback
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
  return {
    id: vertex.id,
    label: normaliseLabel(vertex.text, vertex.id),
    type: 'MermaidNode',
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
    const edgeList = Array.isArray(edges) ? edges.map((edge) => toEdge(edge)) : []
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
