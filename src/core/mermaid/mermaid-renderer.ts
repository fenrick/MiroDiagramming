import { GraphProcessor, type ProcessOptions } from '../graph/graph-processor'
import type { GraphData } from '../graph/graph-service'
import type { LayoutResult } from '../layout/elk-layout'
import type { PositionedNode } from '../layout/layout-core'

import {
  convertMermaidToGraph,
  MermaidConversionError,
  type MermaidConversionOptions,
} from './mermaid-converter'
import { computeMermaidLayout } from './mermaid-layout'
import { layoutGraphDagre } from '../layout/dagre-layout'

export interface MermaidRenderOptions extends ProcessOptions, MermaidConversionOptions {}

/**
 * High-level orchestrator that maps Mermaid definitions to board widgets.
 */
export class MermaidRenderer {
  private readonly processor: GraphProcessor

  public constructor(processor: GraphProcessor = new GraphProcessor()) {
    this.processor = processor
  }

  public get graphProcessor(): GraphProcessor {
    return this.processor
  }

  public async render(source: string, options: MermaidRenderOptions = {}): Promise<GraphData> {
    const { config, expectedType, ...processOptions } = options
    const rawGraph: unknown = await convertMermaidToGraph(source, { config, expectedType })
    const graph = MermaidRenderer.ensureGraphData(rawGraph)
    const fmEngine = MermaidRenderer.frontmatterLayout(source)
    const environment = import.meta.env as Record<string, string | undefined>
    const configuredEngine = environment.VITE_MERMAID_LAYOUT_ENGINE
    const engine =
      fmEngine ?? (typeof configuredEngine === 'string' ? configuredEngine : undefined) ?? 'dagre'

    let layout: LayoutResult
    if (engine === 'mermaid') {
      // Explicitly requested Mermaid DOM geometry (legacy/compare path)
      layout = await computeMermaidLayout(source, graph, { config })
    } else {
      // Dagre-first path: map Mermaid direction and spacing to Dagre
      const direction =
        MermaidRenderer.directionFromSource(source) ?? processOptions.layout?.direction
      const { nodeSpacing, rankSpacing } = MermaidRenderer.spacingFromSource(source)
      layout = await layoutGraphDagre(graph, {
        ...processOptions.layout,
        direction,
        nodeSpacing: nodeSpacing ?? processOptions.layout?.spacing ?? 50,
        rankSpacing: rankSpacing ?? processOptions.layout?.spacing ?? 50,
      })
    }

    // Optional last-resort fallback to Mermaid DOM layout when enabled
    const fallbackFlag = environment.VITE_MERMAID_LAYOUT_FALLBACK
    const fallbackEnabled =
      typeof fallbackFlag === 'string' ? fallbackFlag.toLowerCase() === 'true' : false
    if (engine !== 'mermaid' && fallbackEnabled && MermaidRenderer.isPoorlySpaced(layout)) {
      const mermaidLayout = await computeMermaidLayout(source, graph, { config })
      await this.processor.processGraphWithLayout(graph, mermaidLayout, processOptions)
    } else {
      await this.processor.processGraphWithLayout(graph, layout, processOptions)
    }
    return graph
  }

  /**
   * Detect obviously poor Mermaid native layouts (nodes overlapping/too dense).
   * Falls back to ELK when overlap is detected.
   */
  private static isPoorlySpaced(layout: LayoutResult): boolean {
    const nodes = Object.values(layout.nodes).filter((node): node is PositionedNode =>
      MermaidRenderer.isPositionedNode(node),
    )
    for (const [index, node] of nodes.entries()) {
      if (nodes.slice(index + 1).some((other) => MermaidRenderer.nodesOverlap(node, other))) {
        return true
      }
    }
    return false
  }

  private static isPositionedNode(node: PositionedNode | undefined): node is PositionedNode {
    return node !== undefined
  }

  private static nodesOverlap(a: PositionedNode, b: PositionedNode): boolean {
    const ax2 = a.x + a.width
    const ay2 = a.y + a.height
    const bx2 = b.x + b.width
    const by2 = b.y + b.height
    const horizontalGap = ax2 <= b.x || bx2 <= a.x
    const verticalGap = ay2 <= b.y || by2 <= a.y
    return !(horizontalGap || verticalGap)
  }

  private static directionFromSource(source: string): 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | undefined {
    // Support both classic and v2 flowchart headers, and graph.
    // Examples: "flowchart TD", "flowchart LR", "flowchart-v2 BT", "graph RL"
    const matches = /\b(?:flowchart|flowchart-v2|graph)\s+([A-Z]{2})\b/i.exec(source)
    if (!matches) return undefined
    switch ((matches[1] ?? '').toUpperCase()) {
      case 'TD': {
        return 'DOWN'
      }
      case 'BT': {
        return 'UP'
      }
      case 'LR': {
        return 'RIGHT'
      }
      case 'RL': {
        return 'LEFT'
      }
      default: {
        return undefined
      }
    }
  }

  private static frontmatterLayout(source: string): 'dagre' | 'elk' | 'mermaid' | null {
    // Minimal YAML frontmatter parser for `layout: dagre` under `config:` block.
    // ---\nconfig:\n  layout: dagre\n---
    const m = MermaidRenderer.extractFrontMatter(source)
    if (!m) return null
    const body = m
    const lm = /\blayout:\s*(dagre|elk|mermaid)\b/i.exec(body)
    return lm ? ((lm[1] ?? '').toLowerCase() as 'dagre' | 'elk' | 'mermaid') : null
  }

  /**
   * Extract flowchart spacing from Mermaid front-matter or init directive.
   * Mirrors Mermaid's `flowchart: { nodeSpacing, rankSpacing }` semantics.
   * Defaults to ~50px each when not specified.
   */
  private static spacingFromSource(source: string): {
    nodeSpacing: number | undefined
    rankSpacing: number | undefined
  } {
    const fm = MermaidRenderer.extractFrontMatter(source)
    const fromFm = fm ? MermaidRenderer.parseSpacingFromFrontMatter(fm) : null
    if (fromFm) return fromFm
    const init = MermaidRenderer.extractInitDirective(source)
    const fromInit = init ? MermaidRenderer.parseSpacingFromInit(init) : null
    return fromInit ?? { nodeSpacing: undefined, rankSpacing: undefined }
  }

  private static parseSpacingFromFrontMatter(
    body: string,
  ): { nodeSpacing: number | undefined; rankSpacing: number | undefined } | null {
    let nodeSpacing: number | undefined
    let rankSpacing: number | undefined
    const lines = body.split(/\r?\n/)
    for (const line of lines) {
      const [key, rawValue] = line.split(':')
      if (!rawValue) continue
      const value = Number.parseFloat(rawValue.trim())
      if (!Number.isFinite(value)) continue
      const trimmedKey = key.trim().toLowerCase()
      switch (trimmedKey) {
        case 'nodespacing': {
          nodeSpacing = value
          break
        }
        case 'rankspacing': {
          rankSpacing = value
          break
        }
        default: {
          break
        }
      }
    }
    return nodeSpacing !== undefined || rankSpacing !== undefined
      ? { nodeSpacing, rankSpacing }
      : null
  }

  private static parseSpacingFromInit(
    jsonText: string,
  ): { nodeSpacing: number | undefined; rankSpacing: number | undefined } | null {
    try {
      const parsed = JSON.parse(jsonText) as {
        flowchart?: { nodeSpacing?: number; rankSpacing?: number }
      }
      return {
        nodeSpacing: parsed.flowchart?.nodeSpacing,
        rankSpacing: parsed.flowchart?.rankSpacing,
      }
    } catch {
      return null
    }
  }

  // Faster, lint-friendly front-matter extraction without heavy regex
  private static extractFrontMatter(source: string): string | null {
    const start = source.indexOf('---')
    if (start !== 0) return null
    const end = source.indexOf('\n---', start + 3)
    if (end === -1) return null
    return source.slice(start + 3, end).trim()
  }

  // Extract JSON block from %%{init: {...}}%% without catastrophic regex
  private static extractInitDirective(source: string): string | null {
    const start = source.indexOf('%%{')
    if (start === -1) return null
    const end = source.indexOf('}%%', start)
    if (end === -1) return null
    const inside = source.slice(start + 3, end + 1)
    const markerIndex = inside.toLowerCase().indexOf('init:')
    if (markerIndex === -1) return null
    const jsonStart = inside.indexOf('{', markerIndex)
    if (jsonStart === -1) return null
    return MermaidRenderer.extractBalancedJson(inside, jsonStart)
  }

  private static extractBalancedJson(text: string, startIndex: number): string | null {
    let depth = 0
    for (let cursor = startIndex; cursor < text.length; cursor += 1) {
      const character = text.charAt(cursor)
      if (character === '{') {
        depth += 1
      } else if (character === '}') {
        depth -= 1
        if (depth === 0) {
          return text.slice(startIndex, cursor + 1)
        }
      }
    }
    return null
  }

  private static ensureGraphData(input: unknown): GraphData {
    if (!input || typeof input !== 'object') {
      throw new MermaidConversionError('Mermaid conversion did not return graph data')
    }
    const maybeNodes = (input as { nodes?: unknown }).nodes
    const maybeEdges = (input as { edges?: unknown }).edges
    if (!Array.isArray(maybeNodes) || !Array.isArray(maybeEdges)) {
      throw new MermaidConversionError('Mermaid conversion produced malformed graph data')
    }
    return { nodes: maybeNodes as GraphData['nodes'], edges: maybeEdges as GraphData['edges'] }
  }
}
