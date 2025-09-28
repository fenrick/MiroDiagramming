import { describe, it, expect } from 'vitest'
import { toSafeString } from '../../src/core/utils/string-utilities'

describe('toSafeString', () => {
  it('returns empty string for nullish', () => {
    expect(toSafeString(null)).toBe('')
    expect(toSafeString(undefined)).toBe('')
  })
  it('stringifies objects and numbers', () => {
    expect(toSafeString(123)).toBe('123')
    expect(toSafeString({ a: 1 })).toBe('{"a":1}')
  })
  it('returns strings unchanged', () => {
    expect(toSafeString('  a  b\n')).toBe('  a  b\n')
  })
})
