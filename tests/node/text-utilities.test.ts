import { describe, it, expect } from 'vitest'
import {
  getTextFields,
  readItemText,
  writeItemText,
  getStringAtPath,
  setStringAtPath,
} from '../../src/core/utils/text-utilities'

interface TextWidget extends Record<string, unknown> {
  content?: string
  text?: {
    plainText?: string
    content?: string
  }
  plainText?: string
  data?: Record<string, unknown>
}

describe('text utilities', () => {
  it('reads and writes item text via common and nested paths', () => {
    const item: TextWidget = {
      content: 'A',
      text: { plainText: '', content: '' },
    }
    expect(readItemText(item)).toBe('A')
    writeItemText(item, 'B')
    expect(readItemText(item)).toBe('B')
    // Ensure nested fields also receive updates
    expect(item.text?.plainText).toBe('B')
    expect(item.text?.content).toBe('B')
  })

  it('gets and sets values on nested text objects', () => {
    const item: TextWidget = { text: { plainText: 'x', content: 'x' } }
    expect(getStringAtPath(item, 'text.plainText')).toBe('x')
    setStringAtPath(item, 'text.plainText', 'y')
    expect(getStringAtPath(item, 'text.plainText')).toBe('y')
  })

  it('lists candidate text fields', () => {
    const fields = getTextFields({ content: 'x', text: 'y', data: { text: 'z' } })
    expect(fields.map((f) => f[0])).toContain('content')
  })

  it('returns undefined when no text fields are present', () => {
    expect(readItemText({})).toBeUndefined()
  })

  it('writes to top-level plainText when present', () => {
    const item: TextWidget = { plainText: '' }
    writeItemText(item, 'Z')
    expect(item.plainText).toBe('Z')
  })
})
