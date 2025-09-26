import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import type { GraphProcessor } from '../../src/core/graph/graph-processor'
import { MermaidRenderer } from '../../src/core/mermaid'
import { resetMermaid } from '../../src/core/mermaid/config'

describe('MermaidRenderer', () => {
  beforeEach(() => {
    resetMermaid()
  })

  it('converts mermaid text and passes graph data to the processor', async () => {
    const processed: GraphData[] = []
    const fakeProcessor = {
      processGraph: vi.fn(async (graph: GraphData) => {
        processed.push(graph)
      }),
      getNodeIdMap: vi.fn(() => ({})),
    }
    const renderer = new MermaidRenderer(fakeProcessor as unknown as GraphProcessor)
    const source = `graph TD\n  A-->B`
    const graph = await renderer.render(source, { createFrame: false })

    expect(graph.nodes).toHaveLength(2)
    expect(graph.edges).toHaveLength(1)
    expect(fakeProcessor.processGraph).toHaveBeenCalledTimes(1)
    expect(processed[0]).toEqual(graph)
  })
})
