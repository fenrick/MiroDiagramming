// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('debug-flags', () => {
  beforeEach(() => {
    vi.resetModules()
    // Ensure we are in DEV to enable flags
    vi.stubEnv('DEV', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('parses limits and 429 count from the URL when in dev', async () => {
    history.pushState({}, '', '?debugLimits=near&debug429=3')
    const mod = await import('../../src/core/utils/debug-flags')
    expect(mod.debugFlags.limits).toBe('near')
    expect(mod.debugFlags.count429).toBe(3)
  })

  it('returns empty flags when params are missing', async () => {
    history.pushState({}, '', '?foo=bar')
    const mod = await import('../../src/core/utils/debug-flags')
    expect(mod.debugFlags).toEqual({})
  })
})
