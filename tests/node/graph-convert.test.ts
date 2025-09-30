import { describe, expect, it } from 'vitest'

import { edgesToHierarchy, hierarchyToEdges } from '../../src/core/graph/convert'
import type { GraphData } from '../../src/core/graph/graph-service'
import type { HierNode } from '../../src/core/layout/nested-layout'

const sampleGraph: GraphData = {
  nodes: [
    { id: 'root', label: 'Root', type: 'group', metadata: { role: 'root' } },
    { id: 'child-a', label: 'Child A', type: 'shape', metadata: { size: 1 } },
    { id: 'child-b', label: 'Child B', type: 'shape' },
  ],
  edges: [
    { from: 'root', to: 'child-a' },
    { from: 'root', to: 'child-b' },
  ],
}

describe('graph convert', () => {
  it('converts edges into hierarchy preserving metadata', () => {
    const hierarchy = edgesToHierarchy(sampleGraph)
    expect(hierarchy).toEqual([
      {
        id: 'root',
        label: 'Root',
        type: 'group',
        metadata: { role: 'root' },
        children: [
          {
            id: 'child-a',
            label: 'Child A',
            type: 'shape',
            metadata: { size: 1 },
          },
          {
            id: 'child-b',
            label: 'Child B',
            type: 'shape',
          },
        ],
      },
    ])
  })

  it('throws when an edge references a missing node', () => {
    const broken: GraphData = {
      nodes: [{ id: 'only', label: 'Only', type: 'shape' }],
      edges: [{ from: 'only', to: 'ghost' }],
    }
    expect(() => edgesToHierarchy(broken)).toThrow(/missing node/i)
  })

  it('flattens a hierarchy back into graph data', () => {
    const hierarchy: HierNode[] = [
      {
        id: 'root',
        label: 'Root',
        type: 'group',
        children: [
          { id: 'child-a', label: 'Child A', type: 'shape' },
          {
            id: 'child-b',
            label: 'Child B',
            type: 'shape',
            children: [{ id: 'grand', label: 'Grand', type: 'shape' }],
          },
        ],
      },
    ]

    const result = hierarchyToEdges(hierarchy)
    expect(result).toEqual({
      nodes: [
        { id: 'root', label: 'Root', type: 'group' },
        { id: 'child-a', label: 'Child A', type: 'shape' },
        { id: 'child-b', label: 'Child B', type: 'shape' },
        { id: 'grand', label: 'Grand', type: 'shape' },
      ],
      edges: [
        { from: 'root', to: 'child-a' },
        { from: 'root', to: 'child-b' },
        { from: 'child-b', to: 'grand' },
      ],
    })
  })
})
