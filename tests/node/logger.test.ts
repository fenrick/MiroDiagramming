import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    // default: ENABLE_CONSOLE true (VITE_LOGFIRE_SEND_TO_LOGFIRE !== 'true')
  })

  it('emits info with message-only signature', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { info } = await import('../../src/logger')
    info('hello-world')
    expect(infoSpy).toHaveBeenCalledTimes(1)
    const [msg] = infoSpy.mock.calls[0]!
    expect(String(msg)).toContain('[miro-frontend] hello-world')
  })

  it('emits with attrs-first signature', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const { debug } = await import('../../src/logger')
    debug({ userId: 42 }, 'attrs-first')
    expect(debugSpy).toHaveBeenCalledTimes(1)
    const [msg, attrs] = debugSpy.mock.calls[0]!
    expect(String(msg)).toContain('[miro-frontend] attrs-first')
    expect(attrs).toEqual({ userId: 42 })
  })

  it('uses custom service name when provided', async () => {
    vi.stubEnv('VITE_LOGFIRE_SERVICE_NAME', 'custom-service')
    vi.resetModules()
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { info } = await import('../../src/logger')
    info('msg')
    const [msg] = infoSpy.mock.calls[0]!
    expect(String(msg)).toContain('[custom-service] msg')
  })
})
