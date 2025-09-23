// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'

import { encodeBase64, decodeBase64 } from '../../src/core/utils/base64'

describe('base64 (browser fallback path)', () => {
  it('encodes and decodes using TextEncoder/Decoder and (a|b)toa', () => {
    const msg = 'héllo' // include non-ascii to exercise encoding
    const enc = encodeBase64(msg)
    const dec = decodeBase64(enc)
    expect(dec).toBe(msg)
  })
})
