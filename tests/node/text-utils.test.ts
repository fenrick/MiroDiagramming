import { describe, it, expect } from 'vitest'
import {
  getTextFields,
  readItemText,
  writeItemText,
  getStringAtPath,
  setStringAtPath,
} from '../../src/core/utils/text-utils'

describe('text-utils', () => {
  it('reads and writes item text via common paths', () => {
    const item: Record<string, unknown> = { content: 'A', data: { text: '' } }
    expect(readItemText(item)).toBe('A')
    writeItemText(item, 'B')
    expect(readItemText(item)).toBe('B')
  })

  it('gets and sets values at nested paths', () => {
    const item: Record<string, unknown> = { a: { b: { c: 'x' } } }
    expect(getStringAtPath(item, 'a.b.c')).toBe('x')
    setStringAtPath(item, 'a.b.c', 'y')
    expect(getStringAtPath(item, 'a.b.c')).toBe('y')
  })

  it('lists candidate text fields', () => {
    const fields = getTextFields({ content: 'x', text: 'y', data: { text: 'z' } })
    expect(fields.map((f) => f[0])).toContain('content')
  })
})
