import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64 } from '../../src/core/utils/base64'

describe('base64 utils', () => {
  it('encodes and decodes ASCII', () => {
    const s = 'Hello, world!'
    expect(decodeBase64(encodeBase64(s))).toBe(s)
  })
  it('handles empty strings', () => {
    expect(encodeBase64('')).toBe('')
    expect(decodeBase64('')).toBe('')
  })
})
