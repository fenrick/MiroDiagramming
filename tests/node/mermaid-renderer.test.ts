import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LayoutResult } from '../../src/core/layout/elk-layout'
import type { GraphData } from '../../src/core/graph/graph-service'
import type { GraphProcessor, ProcessOptions } from '../../src/core/graph/graph-processor'
import { MermaidRenderer } from '../../src/core/mermaid/mermaid-renderer'
import { MermaidConversionError } from '../../src/core/mermaid/mermaid-converter'

vi.mock('../../src/core/mermaid/mermaid-converter', async () => {
  const actual = await vi.importActual('../../src/core/mermaid/mermaid-converter')
  return {
    ...(actual as Record<string, unknown>),
    convertMermaidToGraph: vi.fn(() =>
      Promise.resolve({
        nodes: [
          { id: 'A', label: 'A', type: 'MermaidNode', metadata: { domId: 'flowchart-A-0' } },
          { id: 'B', label: 'B', type: 'MermaidNode', metadata: { domId: 'flowchart-B-1' } },
        ],
        edges: [{ from: 'A', to: 'B', metadata: { domId: 'L_A_B_0', template: 'default' } }],
      } satisfies GraphData),
    ),
  }
})

vi.mock('../../src/core/layout/dagre-layout', async () => {
  const actual = await vi.importActual('../../src/core/layout/dagre-layout')
  return {
    ...(actual as Record<string, unknown>),
    layoutGraphDagre: vi.fn(() =>
      Promise.resolve({
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
      } satisfies LayoutResult),
    ),
  }
})

const { convertMermaidToGraph } = await import('../../src/core/mermaid/mermaid-converter')
const { layoutGraphDagre } = await import('../../src/core/layout/dagre-layout')

const directionFromSource = Reflect.get(MermaidRenderer, 'directionFromSource') as (
  source: string,
) => 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | undefined

const spacingFromSource = Reflect.get(MermaidRenderer, 'spacingFromSource') as (source: string) => {
  nodeSpacing: number | undefined
  rankSpacing: number | undefined
}

const extractInitDirective = Reflect.get(MermaidRenderer, 'extractInitDirective') as (
  source: string,
) => string | null

const isPoorlySpaced = Reflect.get(MermaidRenderer, 'isPoorlySpaced') as (
  layout: LayoutResult,
) => boolean

const ensureGraphData = Reflect.get(MermaidRenderer, 'ensureGraphData') as (
  input: unknown,
) => GraphData

describe('MermaidRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses Dagre layout to drive the board processor by default', async () => {
    const processed: { graph: GraphData; layout: LayoutResult; options: ProcessOptions }[] = []
    const fakeProcessor: Pick<GraphProcessor, 'processGraphWithLayout'> = {
      processGraphWithLayout: vi.fn(
        (graph: GraphData, layout: LayoutResult, options: ProcessOptions) => {
          processed.push({ graph, layout, options })
          return Promise.resolve()
        },
      ),
    }
    const renderer = new MermaidRenderer(fakeProcessor as GraphProcessor)
    const result = await renderer.render('graph TD\nA-->B', { createFrame: false })

    expect(convertMermaidToGraph).toHaveBeenCalledTimes(1)
    expect(layoutGraphDagre).toHaveBeenCalledTimes(1)
    expect(fakeProcessor.processGraphWithLayout).toHaveBeenCalledTimes(1)
    expect(result.nodes).toHaveLength(2)
    expect(processed[0]?.layout.nodes.A).toEqual({ id: 'A', x: 10, y: 20, width: 60, height: 30 })
  })
})

describe('MermaidRenderer helpers', () => {
  it('derives direction from flowchart source headers', () => {
    expect(directionFromSource('flowchart TD')).toBe('DOWN')
    expect(directionFromSource('graph rl')).toBe('LEFT')
    expect(directionFromSource('sequenceDiagram')).toBeUndefined()
  })

  it('parses spacing overrides from front matter before init directives', () => {
    const frontMatter = `---\nconfig:\n  nodeSpacing: 80\n  rankSpacing: 40\n---\nflowchart TD\nA-->B`
    const initOnly = `%%{init: {"flowchart": {"nodeSpacing": 60, "rankSpacing": 70}}}%%\nflowchart TD\nA-->B`
    expect(spacingFromSource(frontMatter)).toEqual({ nodeSpacing: 80, rankSpacing: 40 })
    expect(spacingFromSource(initOnly)).toEqual({ nodeSpacing: 60, rankSpacing: 70 })
    expect(spacingFromSource('flowchart TD')).toEqual({
      nodeSpacing: undefined,
      rankSpacing: undefined,
    })
  })

  it('extracts JSON init directives with balanced braces', () => {
    const source =
      '%%{init: {"theme": "dark", "flowchart": {"nodeSpacing": 32}}}%%\nflowchart TD\nA-->B'
    expect(extractInitDirective(source)).toBe('{"theme": "dark", "flowchart": {"nodeSpacing": 32}}')
    expect(extractInitDirective('flowchart TD')).toBeNull()
  })

  it('detects overlapping nodes as poorly spaced layouts', () => {
    const overlapping: LayoutResult = {
      nodes: {
        a: { id: 'a', x: 0, y: 0, width: 100, height: 100 },
        b: { id: 'b', x: 50, y: 50, width: 100, height: 100 },
      },
      edges: [],
    }
    const separated: LayoutResult = {
      nodes: {
        a: { id: 'a', x: 0, y: 0, width: 100, height: 100 },
        b: { id: 'b', x: 250, y: 250, width: 120, height: 120 },
      },
      edges: [],
    }
    expect(isPoorlySpaced(overlapping)).toBe(true)
    expect(isPoorlySpaced(separated)).toBe(false)
  })

  it('validates converted graph data structures', () => {
    const valid: GraphData = { nodes: [], edges: [] }
    expect(ensureGraphData(valid)).toEqual(valid)
    expect(() => ensureGraphData({})).toThrow(MermaidConversionError)
    expect(() => ensureGraphData(null)).toThrow(MermaidConversionError)
  })
})
