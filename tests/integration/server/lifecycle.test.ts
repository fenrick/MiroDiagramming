import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { startServer } from '../../../src/server.js'
import { changeQueue } from '../../../src/queue/changeQueue.js'
import { registerGracefulShutdown } from '../../../src/server/shutdown.js'

afterEach(() => {
  vi.restoreAllMocks()
  ;(changeQueue as any).accepting = true
  ;(changeQueue as any).draining = false
  ;(changeQueue as any).stopPromise = null
})

describe('server lifecycle', () => {
  it('serves health check and stops queue on shutdown', async () => {
    const stopSpy = vi.spyOn(changeQueue, 'stop')
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    let app
    try {
      app = await startServer(0)

      const res = await request(app.server).get('/healthz')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ok' })
      const csp = res.headers['content-security-policy']
      expect(csp).toContain("frame-ancestors 'self' https://miro.com https://*.miro.com")
      expect(csp).toContain("script-src 'self' https://miro.com https://*.miro.com 'unsafe-inline' 'unsafe-eval'")
      expect(csp).toContain("connect-src 'self' https://miro.com https://*.miro.com ws://localhost:* wss://localhost:*")
    } finally {
      await app?.close()
      process.env.NODE_ENV = originalNodeEnv
    }

    expect(stopSpy).toHaveBeenCalledTimes(1)
  })

  it('registers close-with-grace handler that closes the server on signals', async () => {
    const stopSpy = vi.spyOn(changeQueue, 'stop')
    const uninstallSpy = vi.fn()
    type HandlerArgs = { signal?: NodeJS.Signals; err?: Error; manual?: boolean }
    type Handler = (args: HandlerArgs) => Promise<void>
    let capturedHandler: Handler | undefined

    const closeWithGraceStub = vi.fn((...args: unknown[]) => {
      const maybeHandler = typeof args[0] === 'function' ? args[0] : args[1]
      capturedHandler = maybeHandler as Handler
      return { close: vi.fn(), uninstall: uninstallSpy }
    })

    const app = await startServer(0)
    registerGracefulShutdown(app, { closeWithGraceFn: closeWithGraceStub })

    expect(capturedHandler).toBeDefined()
    await capturedHandler?.({ signal: 'SIGTERM' })

    expect(closeWithGraceStub).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
    expect(uninstallSpy).toHaveBeenCalled()
    expect(app.server.listening).toBe(false)
  })
})
