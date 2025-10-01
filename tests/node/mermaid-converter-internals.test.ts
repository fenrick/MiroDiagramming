import { describe, expect, it } from 'vitest'

import { __testables } from '../../src/core/mermaid/mermaid-converter'

describe('mermaid converter internals', () => {
  const {
    parseCssDeclarations,
    parseClassDefs,
    parseSubgraphs,
    parseNodeStyles,
    parseEdgeStyles,
    splitSequenceMessage,
    parseMessageLine,
    mapSequenceArrow,
    convertSequenceDiagram,
    parseStateTransition,
    convertStateDiagram,
    parseErRelation,
    formatErCardinality,
    convertErDiagram,
    parseClassRelation,
    mapClassRelationSymbol,
    convertClassDiagram,
    extractLinkStyles,
    toNode,
    toEdge,
  } = __testables

  it('parses css declarations while filtering unsafe rules', () => {
    expect(parseCssDeclarations()).toEqual({})
    const result = parseCssDeclarations([
      'color:#fff; Stroke-Width : 2px; invalid; background-image: url("https://example")',
      'color:#000;stroke-width:4px;empty: ',
    ])
    expect(result.color).toBe('#000')
    expect(result['stroke-width']).toBe('4px')
    expect(result['background-image']).toMatch(/^url\("https/)
    expect(result).not.toHaveProperty('empty')
  })

  it('parses class definitions and extracts style overrides', () => {
    const defs = parseClassDefs(
      `classDef primary fill:#fff,stroke:#111,color:#222\nclassDef dashed stroke-dasharray:5,fill:none`,
    )
    expect(defs.get('primary')).toEqual({
      fill: '#fff',
      stroke: '#111',
      color: '#222',
    })
    expect(defs.get('dashed')).toEqual({
      fill: 'none',
      ['stroke-dasharray']: '5',
    })
  })

  it('parses subgraphs tracking membership, directions and parents', () => {
    const map = parseSubgraphs(
      `flowchart LR\nsubgraph Outer\n  direction TB\n  subgraph Inner [Nice]\n    nodeA\n  end\n  lone\nend\nnodeB`,
    )
    expect(Array.from(map.names)).toEqual(['Outer', 'Inner'])
    expect(map.membership.get('nodeA')).toBe('Inner')
    expect(map.membership.get('lone')).toBe('Outer')
    expect(map.parents.get('Inner')).toBe('Outer')
    expect(map.directions.get('Outer')).toBe('TB')
    expect(map.directions.get('Inner')).toBeUndefined()
  })

  it('parses node styles, ignoring none/transparent values', () => {
    const overrides = parseNodeStyles({
      id: 'node',
      styles: ['fill:#ffcc00;stroke:#111;stroke-width:3px;color:#123'],
    } as any)
    expect(overrides).toMatchObject({
      fillColor: '#ffcc00',
      borderColor: '#111',
      borderWidth: 3,
      textColor: '#123',
    })

    const ignored = parseNodeStyles({
      id: 'node',
      styles: ['fill:none;stroke:transparent'],
    } as any)
    expect(ignored).toBeUndefined()
  })

  it('parses edge styles from inline declarations and class fallbacks', () => {
    const styled = parseEdgeStyles({
      id: 'e1',
      start: 'A',
      end: 'B',
      styles: ['stroke:#00f;stroke-width:2px;color:#111'],
      stroke: 'dashed',
      classes: ['edge-thickness-thick'],
    } as any)
    expect(styled).toMatchObject({
      strokeColor: '#00f',
      strokeWidth: 2,
      strokeStyle: 'dashed',
      color: '#111',
    })

    const fromClasses = parseEdgeStyles({
      id: 'e2',
      start: 'A',
      end: 'B',
      classes: ['edge-pattern-dotted', 'edge-thickness-thin'],
      styles: [],
    } as any)
    expect(fromClasses).toMatchObject({ strokeStyle: 'dotted', strokeWidth: 1 })
  })

  it('splits sequence messages trimming activation modifiers', () => {
    expect(splitSequenceMessage('Alice->>+Bob')).toEqual({ from: 'Alice', to: 'Bob', arrow: '->>' })
    expect(splitSequenceMessage('NoArrowHere')).toBeUndefined()
  })

  it('parses sequence message lines with optional labels', () => {
    expect(parseMessageLine('Alice-->Bob: Hi')).toEqual({
      from: 'Alice',
      to: 'Bob',
      arrow: '-->',
      label: 'Hi',
    })
    expect(parseMessageLine('Alice-->Bob')).toEqual({ from: 'Alice', to: 'Bob', arrow: '-->' })
  })

  it('maps sequence arrows to templates and style overrides', () => {
    expect(mapSequenceArrow('-->>').template).toBe('flow')
    expect(mapSequenceArrow('-->>').styleOverrides?.strokeStyle).toBe('dashed')
    expect(mapSequenceArrow('..')).toMatchObject({
      template: 'default',
      styleOverrides: { strokeStyle: 'dotted' },
    })
  })

  it('converts sequence diagrams including implicit participants', () => {
    const graph = convertSequenceDiagram(`sequenceDiagram\n  Alice->>Bob: Hi\n  Bob-->>Carol: Yo`)
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['Alice', 'Bob', 'Carol'])
    expect(graph.edges).toHaveLength(2)
    expect(graph.edges[0]?.metadata).toMatchObject({ template: 'flow' })
  })

  it('parses state transitions with optional labels', () => {
    expect(parseStateTransition('Ready --> Running : go')).toEqual({
      from: 'Ready',
      to: 'Running',
      label: 'go',
    })
    expect(parseStateTransition('Invalid line')).toBeUndefined()
  })

  it('converts state diagrams skipping start/end markers', () => {
    const graph = convertStateDiagram(
      `stateDiagram\n  [*] --> Ready\n  Ready --> Running : start\n  Running --> [*]`,
    )
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['Ready', 'Running'])
    expect(graph.edges.map((e) => e.label)).toEqual(['start'])
  })

  it('parses ER relations supporting quoted identifiers', () => {
    expect(parseErRelation('"Order Item" ||--o{ ORDER : contains')).toEqual({
      left: 'Order Item',
      symbol: '||--o{',
      right: 'ORDER',
      label: 'contains',
    })
    expect(parseErRelation('incomplete relation')).toBeUndefined()
  })

  it('formats ER cardinality pairs', () => {
    expect(formatErCardinality('||--o{')).toBe('|| .. o{')
    expect(formatErCardinality('broken')).toBe('broken')
  })

  it('converts ER diagrams composing labels with cardinality', () => {
    const graph = convertErDiagram(`erDiagram\n  A ||--o{ B : relates`)
    expect(graph.edges[0]).toMatchObject({ label: 'relates (|| .. o{)' })
  })

  it('parses class relations and maps symbols to templates', () => {
    expect(parseClassRelation('A <|-- B : inherits')).toEqual({
      left: 'A',
      symbol: '<|--',
      right: 'B',
      label: 'inherits',
    })
    expect(parseClassRelation('invalid')).toBeUndefined()

    const mapping = mapClassRelationSymbol('<|--')
    expect(mapping).toMatchObject({ template: 'inheritance', direction: 'reverse' })
    expect(mapClassRelationSymbol('..>')).toMatchObject({
      template: 'dependency',
      styleOverrides: { strokeStyle: 'dashed' },
    })
  })

  it('converts class diagrams handling relations and declarations', () => {
    const graph = convertClassDiagram(`classDiagram\n  class Foo\n  Foo : property\n  Foo <|-- Bar`)
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['Bar', 'Foo'])
    expect(graph.edges[0]).toMatchObject({ metadata: { template: 'inheritance' } })
  })

  it('extracts link styles with explicit indices and defaults', () => {
    const overrides = extractLinkStyles(
      `linkStyle 0 stroke:#f00,stroke-width:5\nlinkStyle default stroke:#0f0`,
    )
    expect(overrides.get(0)).toMatchObject({ strokeColor: '#f00', strokeWidth: 5 })
    expect(overrides.get(-1)).toMatchObject({ strokeColor: '#0f0' })
  })

  it('converts raw vertices and edges into graph entities', () => {
    const node = toNode({
      id: 'A',
      text: ' Label ',
      classes: ['app'],
      styles: ['fill:#fff'],
      shape: 'rect',
      domId: 'node-A',
      props: { test: true },
    } as any)
    expect(node).toMatchObject({
      id: 'A',
      label: 'Label',
      metadata: expect.objectContaining({ domId: 'node-A' }),
    })

    const edge = toEdge({
      id: 'E1',
      start: 'A',
      end: 'B',
      text: ' label ',
      classes: ['edge-pattern-dashed'],
      styles: ['stroke-width:3px'],
    } as any)
    expect(edge).toMatchObject({
      from: 'A',
      to: 'B',
      label: 'label',
      metadata: expect.objectContaining({ template: 'default' }),
    })
  })
})
