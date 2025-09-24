import { describe, it, expect } from 'vitest'

import { calculateGrid, calculateGridPositions } from '../../src/board/grid-layout'

describe('grid-layout', () => {
  it('calculates row-major positions', () => {
    const pos = calculateGrid(6, { cols: 3, padding: 10 }, 100, 50)
    expect(pos).toEqual([
      { x: 0, y: 0 },
      { x: 110, y: 0 },
      { x: 220, y: 0 },
      { x: 0, y: 60 },
      { x: 110, y: 60 },
      { x: 220, y: 60 },
    ])
  })

  it('calculates column-major positions with balanced columns', () => {
    const pos = calculateGrid(5, { cols: 2, padding: 10, vertical: true }, 10, 10)
    // Column sizes: [3,2]
    expect(pos).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 20 },
      { x: 0, y: 40 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ])
  })

  it('wraps options with calculateGridPositions', () => {
    const pos = calculateGridPositions(
      { cols: 2, padding: 5, sortOrientation: 'vertical' },
      3,
      10,
      10,
    )
    expect(pos).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 15 },
      { x: 15, y: 0 },
    ])
  })
})
