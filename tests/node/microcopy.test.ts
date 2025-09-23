import { describe, it, expect } from 'vitest'

import { getErrorToastMessage, errorToastText } from '../../src/ui/microcopy'

describe('microcopy', () => {
  it('maps statuses to friendly messages', () => {
    expect(getErrorToastMessage(429)).toBe(errorToastText[429])
    expect(getErrorToastMessage(401)).toBe(errorToastText[401])
    expect(getErrorToastMessage(500)).toBe(errorToastText[500])
    expect(getErrorToastMessage(503)).toBe(errorToastText[500])
    expect(getErrorToastMessage(418)).toContain('unexpected')
  })
})
