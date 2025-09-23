import { describe, it, expect } from 'vitest'
import {
  getTextFields,
  readItemText,
  writeItemText,
  getStringAtPath,
  setStringAtPath,
} from '../../src/core/utils/text-utils'

describe('text-utils', () => {
  it('reads and writes item text via common and nested paths', () => {
    const item: Record<string, unknown> = {
      content: 'A',
      text: { plainText: '', content: '' },
    }
    expect(readItemText(item)).toBe('A')
    writeItemText(item, 'B')
    expect(readItemText(item)).toBe('B')
    // Ensure nested fields also receive updates
    expect((item as any).text.plainText).toBe('B')
    expect((item as any).text.content).toBe('B')
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

  it('returns undefined when no text fields are present', () => {
    expect(readItemText({})).toBeUndefined()
  })

  it('writes to top-level plainText when present', () => {
    const item: Record<string, unknown> = { plainText: '' }
    writeItemText(item, 'Z')
    expect((item as any).plainText).toBe('Z')
  })
})
