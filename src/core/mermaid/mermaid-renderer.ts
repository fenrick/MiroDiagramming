import { GraphProcessor, type ProcessOptions } from '../graph/graph-processor'
import type { GraphData } from '../graph/graph-service'

import { convertMermaidToGraph, type MermaidConversionOptions } from './mermaid-converter'
import { computeMermaidLayout } from './mermaid-layout'

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
    const layout = await computeMermaidLayout(source, graph, { config })
    await this.processor.processGraphWithLayout(graph, layout, processOptions)
    return graph
  }
}
