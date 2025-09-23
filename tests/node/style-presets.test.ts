import { describe, it, expect } from 'vitest'

import { STYLE_PRESET_NAMES, stylePresets } from '../../src/ui/style-presets'

describe('style-presets', () => {
  it('exposes preset names derived from templates', () => {
    expect(STYLE_PRESET_NAMES.length).toBeGreaterThan(0)
  })

  it('derives a preset with sensible defaults and resolved values', () => {
    const any = stylePresets[STYLE_PRESET_NAMES[0]!]!
    expect(any.label.length).toBeGreaterThan(0)
    expect(typeof any.borderWidth).toBe('number')
    expect(typeof any.fillColor).toBe('string')
  })
})
