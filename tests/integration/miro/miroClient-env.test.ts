import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('miroClient env + singleton', () => {
  it('returns the same instance across calls', async () => {
    vi.mock('@mirohq/miro-api', () => ({
      Miro: class {
        constructor() {}
      },
    }))
    process.env.MIRO_CLIENT_ID = 'id'
    process.env.MIRO_CLIENT_SECRET = 'secret'
    process.env.MIRO_REDIRECT_URL = 'http://localhost/cb'
    const mod = await import('../../../src/miro/miroClient.js')
    const a = mod.getMiro()
    const b = mod.getMiro()
    expect(a).toBe(b)
  })

  it('throws when required OAuth env vars are missing', async () => {
    vi.mock('@mirohq/miro-api', () => ({
      Miro: class {
        constructor() {}
      },
    }))
    delete process.env.MIRO_CLIENT_ID
    delete process.env.MIRO_CLIENT_SECRET
    delete process.env.MIRO_REDIRECT_URL
    await expect(
      import('../../../src/miro/miroClient.js').then((m) => m.getMiro()),
    ).rejects.toThrow(/Miro OAuth env not configured/)
  })
})
