import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  adjustColor,
  luminance,
  contrastRatio,
  ensureContrast,
  mixColors,
  resolveColor,
} from '../../src/core/utils/color-utils'

describe('color-utils', () => {
  it('converts between hex and rgb', () => {
    const rgb = hexToRgb('#336699')
    expect(rgb).toEqual({ r: 0x33, g: 0x66, b: 0x99 })
    expect(rgbToHex(rgb)).toBe('#336699')
  })

  it('adjusts color towards white/black', () => {
    expect(adjustColor('#000000', 1)).toBe('#ffffff')
    expect(adjustColor('#ffffff', -1)).toBe('#000000')
  })

  it('computes luminance and contrast ratio', () => {
    const lumWhite = luminance({ r: 255, g: 255, b: 255 })
    const lumBlack = luminance({ r: 0, g: 0, b: 0 })
    expect(lumWhite).toBeGreaterThan(lumBlack)
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThanOrEqual(21)
  })

  it('ensures sufficient contrast by choosing black/white when needed', () => {
    const fgOnWhite = ensureContrast('#ffffff', '#eeeeee')
    expect(contrastRatio('#ffffff', fgOnWhite)).toBeGreaterThanOrEqual(4.5)
    const fgOnBlack = ensureContrast('#000000', '#111111')
    expect(contrastRatio('#000000', fgOnBlack)).toBeGreaterThanOrEqual(4.5)
  })

  it('mixes colors linearly', () => {
    expect(mixColors('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mixColors('#ff0000', '#00ff00', 0.5)).toBe('#808000')
  })

  it('resolves tokens; falls back without DOM for CSS variables', () => {
    expect(resolveColor('#ABCDEF', '#000000')).toBe('#abcdef')
    expect(resolveColor('var(--not-set)', '#112233')).toBe('#112233')
  })
})
