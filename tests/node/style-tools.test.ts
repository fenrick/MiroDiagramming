import { describe, it, expect } from 'vitest'
import { findStyleKey, extractFillColor } from '../../src/board/style-tools'

describe('style-tools', () => {
  it('findStyleKey returns the first present key', () => {
    const style: Record<string, unknown> = { strokeWidth: 2 }
    expect(findStyleKey(style, ['borderWidth', 'strokeWidth', 'lineWidth'])).toBe('strokeWidth')
    expect(findStyleKey(style, ['fillOpacity', 'opacity'])).toBeNull()
  })

  it('extractFillColor returns resolved hex when present', () => {
    expect(extractFillColor(undefined)).toBeNull()
    expect(extractFillColor({} as any)).toBeNull()
    const item = { style: { fillColor: '#ff0000' } }
    expect(extractFillColor(item)).toBe('#ff0000')
  })
})
