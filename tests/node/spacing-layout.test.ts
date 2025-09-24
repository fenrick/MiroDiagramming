import { describe, it, expect } from 'vitest'

import {
  calculateGrowthPlan,
  calculateSpacingOffsets,
  getDimension,
} from '../../src/board/spacing-layout'

describe('spacing-layout', () => {
  it('computes spacing offsets', () => {
    expect(calculateSpacingOffsets(4, 10)).toEqual([0, 10, 20, 30])
  })

  it('gets dimension safely', () => {
    expect(getDimension({ width: 5 } as any, 'width')).toBe(5)
    expect(getDimension({} as any, 'height')).toBe(0)
  })

  it('calculates growth plan for x axis', () => {
    const items = [
      { x: 0, width: 10 } as any,
      { x: 20, width: 10 } as any,
      { x: 40, width: 10 } as any,
    ]
    const plan = calculateGrowthPlan(items, 'x', 5)
    expect(plan.size).toBeGreaterThan(0)
    expect(plan.positions.length).toBe(3)
    // positions are evenly distributed
    expect(plan.positions[1]! - plan.positions[0]!).toBeCloseTo(
      plan.positions[2]! - plan.positions[1]!,
    )
  })
})
