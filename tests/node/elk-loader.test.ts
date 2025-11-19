import { afterEach, describe, expect, it, vi } from 'vitest'

describe('loadElk', () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('caches the constructor returned in Node runtime', async () => {
    const constructor = class MockElk {}
    vi.doMock('elkjs/lib/elk.bundled.js', () => ({ default: constructor }))
    const module = await import('../../src/core/layout/elk-loader')
    const first = await module.loadElk()
    const second = await module.loadElk()

    expect(first).toBe(constructor)
    expect(second).toBe(constructor)
  })

  it('exposes a CDN url tied to the exported version constant', async () => {
    const module = await import('../../src/core/layout/elk-loader')
    expect(module.ELK_CDN_URL).toContain(module.ELK_CDN_VERSION)
    expect(module.ELK_CDN_URL.endsWith('/lib/elk.bundled.js')).toBe(true)
  })
})
