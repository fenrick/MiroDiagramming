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
    const mermaidLayout = await computeMermaidLayout(source, graph, { config })
    const layoutEngine =
      fmEngine ?? (import.meta as ImportMeta).env?.VITE_MERMAID_LAYOUT_ENGINE ?? 'mermaid'
    const layout =
      layoutEngine === 'dagre'
        ? await layoutGraphDagre(graph, {
            ...processOptions.layout,
            direction:
              MermaidRenderer.directionFromSource(source) ?? processOptions.layout?.direction,
          })
        : mermaidLayout
    const fallbackEnabled =
      typeof (import.meta as ImportMeta).env?.VITE_MERMAID_LAYOUT_FALLBACK === 'string'
        ? (import.meta as ImportMeta).env.VITE_MERMAID_LAYOUT_FALLBACK.toLowerCase() === 'true'
        : false
    if (fallbackEnabled && MermaidRenderer.isPoorlySpaced(layout)) {
      await this.processor.processGraph(graph, processOptions)
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
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i]!
      const ax1 = a.x
      const ay1 = a.y
      const ax2 = a.x + a.width
      const ay2 = a.y + a.height
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j]!
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
    const m = /\b(?:flowchart|flowchart-v2|graph)\s+([A-Za-z]{2})\b/i.exec(source)
    if (!m) return undefined
    const code = m[1]!.toUpperCase()
    switch (code) {
      case 'TD':
        return 'DOWN'
      case 'BT':
        return 'UP'
      case 'LR':
        return 'RIGHT'
      case 'RL':
        return 'LEFT'
      default:
        return undefined
    }
  }

  private static frontmatterLayout(source: string): 'dagre' | 'elk' | 'mermaid' | null {
    // Minimal YAML frontmatter parser for `layout: dagre` under `config:` block.
    // ---\nconfig:\n  layout: dagre\n---
    const m = /^---\s*([\s\S]*?)\n---/m.exec(source)
    if (!m) return null
    const body = m[1] ?? ''
    const lm = /\blayout:\s*(dagre|elk|mermaid)\b/i.exec(body)
    return lm ? (lm[1]!.toLowerCase() as 'dagre' | 'elk' | 'mermaid') : null
  }
}
