import { afterEach, describe, expect, it, vi } from 'vitest'

describe('miroClient env + singleton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns the same instance across calls', async () => {
    vi.resetModules()
    let getMiro!: () => unknown
    vi.mock('../../../src/config/env.js', () => ({
      loadEnv: () => ({
        MIRO_CLIENT_ID: 'id',
        MIRO_CLIENT_SECRET: 'secret',
        MIRO_REDIRECT_URL: 'http://localhost/cb',
      }),
    }))
    // Mock SDK to a trivial class to avoid side-effects
    vi.mock('@mirohq/miro-api', () => ({
      Miro: class {
        constructor() {}
      },
    }))
    const mod = await import('../../../src/miro/miroClient.js')
    getMiro = mod.getMiro
    const a = getMiro()
    const b = getMiro()
    expect(a).toBe(b)
  })
})
