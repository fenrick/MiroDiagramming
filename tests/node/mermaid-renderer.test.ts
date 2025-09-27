import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GraphData } from '../../src/core/graph/graph-service'
import type { LayoutResult } from '../../src/core/layout/elk-layout'
import { MermaidRenderer } from '../../src/core/mermaid/mermaid-renderer'

vi.mock('../../src/core/mermaid/mermaid-converter', () => ({
  convertMermaidToGraph: vi.fn(
    async () =>
      ({
        nodes: [
          { id: 'A', label: 'A', type: 'MermaidNode', metadata: { domId: 'flowchart-A-0' } },
          { id: 'B', label: 'B', type: 'MermaidNode', metadata: { domId: 'flowchart-B-1' } },
        ],
        edges: [{ from: 'A', to: 'B', metadata: { domId: 'L_A_B_0', template: 'default' } }],
      }) satisfies GraphData,
  ),
}))

vi.mock('../../src/core/mermaid/mermaid-layout', () => ({
  computeMermaidLayout: vi.fn(
    async () =>
      ({
        nodes: {
          A: { id: 'A', x: 10, y: 20, width: 60, height: 30 },
          B: { id: 'B', x: 110, y: 120, width: 60, height: 30 },
        },
        edges: [
          {
            startPoint: { x: 40, y: 35 },
            endPoint: { x: 140, y: 135 },
          },
        ],
      }) satisfies LayoutResult,
  ),
}))

const { convertMermaidToGraph } = await import('../../src/core/mermaid/mermaid-converter')
const { computeMermaidLayout } = await import('../../src/core/mermaid/mermaid-layout')

describe('MermaidRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses mermaid layout to drive the board processor', async () => {
    const processed: { graph: GraphData; layout: LayoutResult; options: unknown }[] = []
    const fakeProcessor = {
      processGraphWithLayout: vi.fn(async (graph: GraphData, layout: LayoutResult, options) => {
        processed.push({ graph, layout, options })
      }),
    }
    const renderer = new MermaidRenderer(fakeProcessor as unknown as any)
    const result = await renderer.render('graph TD\nA-->B', { createFrame: false })

    expect(convertMermaidToGraph).toHaveBeenCalledTimes(1)
    expect(computeMermaidLayout).toHaveBeenCalledTimes(1)
    expect(fakeProcessor.processGraphWithLayout).toHaveBeenCalledTimes(1)
    expect(result.nodes).toHaveLength(2)
    expect(processed[0]?.layout.nodes.A).toEqual({ id: 'A', x: 10, y: 20, width: 60, height: 30 })
  })
})
