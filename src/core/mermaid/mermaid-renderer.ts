import { GraphProcessor, type ProcessOptions } from '../graph/graph-processor'

import { convertMermaidToGraph, type MermaidConversionOptions } from './mermaid-converter'

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

  public async render(source: string, options: MermaidRenderOptions = {}): Promise<void> {
    const { config, expectedType, ...processOptions } = options
    const graph = await convertMermaidToGraph(source, { config, expectedType })
    await this.processor.processGraph(graph, processOptions)
  }
}
