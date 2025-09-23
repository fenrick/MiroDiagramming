import { describe, it, expect } from 'vitest'

import { presetStyle } from '../../src/board/format-tools'
import type { StylePreset } from '../../src/ui/style-presets'

describe('format-tools', () => {
  it('converts a StylePreset into resolved widget style', () => {
    const preset: StylePreset = {
      label: 'Test',
      fontColor: 'var(--colors-gray-900)',
      borderColor: 'var(--colors-gray-200)',
      borderWidth: 3,
      fillColor: 'var(--colors-white)',
    }
    const resolved = presetStyle(preset)
    expect(resolved.borderWidth).toBe(3)
    // CSS variables are not defined in tests so fallbacks are used
    expect(resolved.color).toBe('#000000')
    expect(resolved.borderColor).toBe('#000000')
    expect(resolved.fillColor).toBe('#ffffff')
  })
})
