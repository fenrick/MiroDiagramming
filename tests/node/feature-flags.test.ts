import { describe, expect, it } from 'vitest'

import {
  isExperimentalShapesEnabled,
  isMermaidEnabled,
  type FlagOptions,
} from '../../src/core/mermaid/feature-flags'

const emptyEnvironment: FlagOptions = { environment: {} }

describe('feature-flags', () => {
  describe('isMermaidEnabled', () => {
    it('defaults to enabled when flag is missing', () => {
      expect(isMermaidEnabled(emptyEnvironment)).toBe(true)
    })

    it('treats any `false` variant as disabled', () => {
      expect(isMermaidEnabled({ environment: { VITE_MERMAID_ENABLED: 'FALSE ' } })).toBe(false)
    })

    it('falls back to default when value is not a string', () => {
      expect(
        isMermaidEnabled({
          environment: { VITE_MERMAID_ENABLED: 0 } as Record<string, unknown>,
        }),
      ).toBe(true)
    })
  })

  describe('isExperimentalShapesEnabled', () => {
    it('defaults to disabled when flag is missing', () => {
      expect(isExperimentalShapesEnabled(emptyEnvironment)).toBe(false)
    })

    it('enables shapes when set to true', () => {
      expect(
        isExperimentalShapesEnabled({
          environment: { VITE_MIRO_EXPERIMENTAL_SHAPES: 'true' },
        }),
      ).toBe(true)
    })

    it('ignores unexpected values and preserves the default', () => {
      expect(
        isExperimentalShapesEnabled({
          environment: { VITE_MIRO_EXPERIMENTAL_SHAPES: 'nope' },
        }),
      ).toBe(false)
    })
  })
})
