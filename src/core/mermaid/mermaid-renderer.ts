import { GraphProcessor, type ProcessOptions } from '../graph/graph-processor'
import type { GraphData } from '../graph/graph-service'
import type { LayoutResult } from '../layout/elk-layout'

import { convertMermaidToGraph, type MermaidConversionOptions } from './mermaid-converter'
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
    const graph = await convertMermaidToGraph(source, { config, expectedType })
    const fmEngine = MermaidRenderer.frontmatterLayout(source)
    const engine =
      fmEngine ?? (import.meta as ImportMeta).env?.VITE_MERMAID_LAYOUT_ENGINE ?? 'dagre'

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
    const fallbackEnabled =
      typeof (import.meta as ImportMeta).env?.VITE_MERMAID_LAYOUT_FALLBACK === 'string'
        ? (import.meta as ImportMeta).env.VITE_MERMAID_LAYOUT_FALLBACK.toLowerCase() === 'true'
        : false
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
    const nodes = Object.values(layout.nodes)
    for (let index = 0; index < nodes.length; index += 1) {
      const a = nodes[index]!
      const ax1 = a.x
      const ay1 = a.y
      const ax2 = a.x + a.width
      const ay2 = a.y + a.height
      for (let index_ = index + 1; index_ < nodes.length; index_ += 1) {
        const b = nodes[index_]!
        const bx1 = b.x
        const by1 = b.y
        const bx2 = b.x + b.width
        const by2 = b.y + b.height
        const noOverlap = ax2 <= bx1 || bx2 <= ax1 || ay2 <= by1 || by2 <= ay1
        if (!noOverlap) {
          return true
        }
      }
    }
    return false
  }

  private static directionFromSource(source: string): 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | undefined {
    // Support both classic and v2 flowchart headers, and graph.
    // Examples: "flowchart TD", "flowchart LR", "flowchart-v2 BT", "graph RL"
    const m = /\b(?:flowchart|flowchart-v2|graph)\s+([A-Z]{2})\b/i.exec(source)
    if (!m) return undefined
    const code = m[1]!.toUpperCase()
    switch (code) {
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
    return lm ? (lm[1]!.toLowerCase() as 'dagre' | 'elk' | 'mermaid') : null
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
    // Front-matter YAML: ---\nconfig:\n  flowchart:\n    nodeSpacing: 40\n    rankSpacing: 60\n---
    const fm = MermaidRenderer.extractFrontMatter(source)
    if (fm) {
      const body = fm
      const nodeM = /\bnodeSpacing\s*:\s*(\d+(?:\.\d+)?)\b/i.exec(body)
      const rankM = /\brankSpacing\s*:\s*(\d+(?:\.\d+)?)\b/i.exec(body)
      const nodeSpacing = nodeM ? Number(nodeM[1]) : undefined
      const rankSpacing = rankM ? Number(rankM[1]) : undefined
      if (Number.isFinite(nodeSpacing) || Number.isFinite(rankSpacing)) {
        return { nodeSpacing, rankSpacing }
      }
    }
    // Init directive: %%{init: { flowchart: { nodeSpacing: 50, rankSpacing: 60 } }}%%
    const init = MermaidRenderer.extractInitDirective(source)
    if (init) {
      try {
        const parsed = JSON.parse(init) as {
          flowchart?: { nodeSpacing?: number; rankSpacing?: number }
        }
        const nodeSpacing = parsed.flowchart?.nodeSpacing
        const rankSpacing = parsed.flowchart?.rankSpacing
        return { nodeSpacing, rankSpacing }
      } catch {
        // ignore JSON parsing errors
      }
    }
    return { nodeSpacing: undefined, rankSpacing: undefined }
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
    const inside = source.slice(start + 3, end + 1) // include closing '}'
    const marker = 'init:'
    const index = inside.toLowerCase().indexOf(marker)
    if (index === -1) return null
    const jsonStart = inside.indexOf('{', index)
    if (jsonStart === -1) return null
    // naive brace matching for the JSON object
    let depth = 0
    for (let index = jsonStart; index < inside.length; index += 1) {
      const ch = inside[index]
      if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          return inside.slice(jsonStart, index + 1)
        }
      }
    }
    return null
  }
}
