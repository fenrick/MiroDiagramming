import { describe, it, expect } from 'vitest'
import { ASPECT_RATIO_IDS, aspectRatioValue, ratioHeight } from '../../src/core/utils/aspect-ratio'

describe('aspect-ratio', () => {
  it('exposes stable ids', () => {
    expect(ASPECT_RATIO_IDS.length).toBeGreaterThan(0)
  })
  it('computes heights from ratios', () => {
    const w = 640
    const r = aspectRatioValue('16:9')
    expect(ratioHeight(w, r)).toBeCloseTo((9 / 16) * w, 5)
  })
})
