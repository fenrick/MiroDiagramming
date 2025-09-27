// @vitest-environment jsdom

import { describe, expect, it, beforeEach } from 'vitest'

import {
  convertMermaidToGraph,
  MermaidConversionError,
} from '../../src/core/mermaid/mermaid-converter'
import { resetMermaid } from '../../src/core/mermaid/config'

describe('convertMermaidToGraph', () => {
  beforeEach(() => {
    resetMermaid()
  })

  it('converts a simple flowchart into graph data', async () => {
    const source = `graph TD\n  A[Start]-->B{Decision}\n  B-->C[Path 1]\n  B-->D[Path 2]`
    const graph = await convertMermaidToGraph(source)
    expect(graph.nodes).toHaveLength(4)
    const ids = graph.nodes.map((n) => n.id)
    expect(ids).toEqual(['A', 'B', 'C', 'D'])
    expect(graph.nodes[0]?.type).toBe('MermaidNode')
    expect(graph.nodes.find((n) => n.id === 'A')?.label).toBe('Start')
    expect(graph.edges).toHaveLength(3)
    expect(graph.edges[0]?.metadata).toMatchObject({ domId: expect.stringContaining('L_') })
    expect(graph.edges.map((e) => [e.from, e.to])).toEqual([
      ['A', 'B'],
      ['B', 'C'],
      ['B', 'D'],
    ])
  })

  it('captures style overrides from Mermaid directives', async () => {
    const source = `graph TD\n  A[Styled]\n  B[Plain]\n  A-->B\n  classDef app fill:#ffcc00,stroke:#111,stroke-width:3px,color:#222\n  class A app\n  style A fill:#ffcc00,stroke:#111,stroke-width:3px,color:#222\n  linkStyle 0 stroke:#f00,stroke-width:5px,stroke-dasharray:5`
    const graph = await convertMermaidToGraph(source)
    const styledNode = graph.nodes.find((n) => n.id === 'A')
    const nodeMeta = styledNode?.metadata as
      | { styleOverrides?: Record<string, unknown> }
      | undefined
    expect(nodeMeta?.styleOverrides).toMatchObject({
      fillColor: '#ffcc00',
      borderColor: '#111',
      borderWidth: 3,
      textColor: '#222',
    })
    expect(styledNode?.type).toBe('Application')
    const edgeMeta = graph.edges[0]?.metadata as
      | { styleOverrides?: Record<string, unknown> }
      | undefined
    expect(edgeMeta?.styleOverrides).toMatchObject({
      strokeColor: '#f00',
      strokeWidth: 5,
    })
  })

  it('converts sequence diagrams into graph data', async () => {
    const source = `sequenceDiagram\n  participant Alice\n  participant Bob\n  Alice->>Bob: Hello`
    const graph = await convertMermaidToGraph(source)
    expect(graph.nodes.map((n) => n.id)).toEqual(['Alice', 'Bob'])
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]).toMatchObject({ from: 'Alice', to: 'Bob', label: 'Hello' })
  })

  it('converts class diagrams into graph data', async () => {
    const source = `classDiagram\n  ClassA <|-- ClassB : inherits`
    const graph = await convertMermaidToGraph(source)
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['ClassA', 'ClassB'])
    expect(graph.edges).toHaveLength(1)
    const edge = graph.edges[0]
    expect([edge.from, edge.to].sort()).toEqual(['ClassA', 'ClassB'])
    expect(edge.metadata).toMatchObject({ template: 'inheritance' })
  })

  it('throws for unsupported diagrams', async () => {
    const source = `erDiagram\n  CUSTOMER ||--o{ ORDER : places`
    await expect(convertMermaidToGraph(source)).rejects.toBeInstanceOf(MermaidConversionError)
  })

  it('rejects empty diagrams', async () => {
    await expect(convertMermaidToGraph('   ')).rejects.toThrow('Mermaid definition is empty')
  })
})
