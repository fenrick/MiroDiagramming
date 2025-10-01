import { describe, expect, it } from 'vitest'

import { computeEdgeHints, relativePosition } from '../../src/core/layout/layout-utilities'

describe('layout utilities', () => {
  it('clamps relative positions to [0,1]', () => {
    const node = { x: 10, y: 10, width: 100, height: 50 }
    const point = { x: -20, y: 200 }

    expect(relativePosition(node, point)).toEqual({ x: 0, y: 1 })
  })

  it('derives fractional positions when explicit side hints are absent', () => {
    const graph = {
      edges: [{ from: 'a', to: 'b' }],
    }
    const layout = {
      nodes: {
        a: { x: 0, y: 0, width: 100, height: 100 },
        b: { x: 200, y: 0, width: 100, height: 100 },
      },
      edges: [
        {
          startPoint: { x: 100, y: 50 },
          endPoint: { x: 200, y: 50 },
        },
      ],
    }

    const [hint] = computeEdgeHints(graph, layout)
    if (!hint) {
      throw new Error('Expected edge hint to be generated')
    }
    expect(hint).toEqual({
      startPosition: { x: 1, y: 0.5 },
      endPosition: { x: 0, y: 0.5 },
      shape: 'straight',
    })
  })

  it('honours provided side hints and chooses elbowed shape for opposite sides', () => {
    const graph = { edges: [{ from: 'a', to: 'b' }] }
    const layout = {
      nodes: {
        a: { x: 0, y: 0, width: 100, height: 100 },
        b: { x: 200, y: 0, width: 100, height: 100 },
      },
      edges: [
        {
          startPoint: { x: 100, y: 0 },
          endPoint: { x: 200, y: 100 },
          hintSides: { start: 'E' as const, end: 'W' as const },
        },
      ],
    }

    const [hint] = computeEdgeHints(graph, layout)
    if (!hint) {
      throw new Error('Expected edge hint to be generated')
    }
    expect(hint).toEqual({
      startPosition: { x: 1, y: 0.5 },
      endPosition: { x: 0, y: 0.5 },
      shape: 'elbowed',
    })
  })

  it('classifies multi-segment polylines as curved when mostly diagonal', () => {
    const graph = { edges: [{ from: 'a', to: 'b' }] }
    const layout = {
      nodes: {
        a: { x: 0, y: 0, width: 100, height: 100 },
        b: { x: 200, y: 200, width: 100, height: 100 },
      },
      edges: [
        {
          startPoint: { x: 0, y: 0 },
          bendPoints: [
            { x: 80, y: 20 },
            { x: 140, y: 100 },
          ],
          endPoint: { x: 200, y: 200 },
        },
      ],
    }

    const [hint] = computeEdgeHints(graph, layout)
    expect(hint?.shape).toBe('curved')
  })
})
