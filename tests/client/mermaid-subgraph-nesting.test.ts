// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'

import { convertMermaidToGraph } from '../../src/core/mermaid/mermaid-converter'
import { resetMermaid } from '../../src/core/mermaid/config'

describe('Mermaid subgraph nesting', () => {
  beforeEach(() => resetMermaid())

  it('sets parent on inner subgraph containers', async () => {
    const src = `flowchart LR\nsubgraph Outer\n  direction TB\n  subgraph Inner\n    A-->B\n  end\nend`
    const g = await convertMermaidToGraph(src)
    const outer = g.nodes.find((n) => n.id === 'Outer')!
    const inner = g.nodes.find((n) => n.id === 'Inner')!
    expect((outer.metadata as any)?.isSubgraph).toBe(true)
    expect((inner.metadata as any)?.isSubgraph).toBe(true)
    expect((inner.metadata as any)?.parent).toBe('Outer')
    const a = g.nodes.find((n) => n.id === 'A')!
    const b = g.nodes.find((n) => n.id === 'B')!
    expect((a.metadata as any)?.parent).toBe('Inner')
    expect((b.metadata as any)?.parent).toBe('Inner')
  })
})
