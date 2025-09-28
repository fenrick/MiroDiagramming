// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('notifications helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('trims long error messages and logs details', async () => {
    const long = 'x'.repeat(100)
    const errorSpy = vi.fn()
    const infoSpy = vi.fn()
    const debugSpy = vi.fn()
    vi.doMock('../../src/logger', () => ({
      error: (msg: string) => errorSpy(msg),
      info: (msg: string) => infoSpy(msg),
      debug: (msg: string) => debugSpy(msg),
    }))
    const toastSpy = vi.fn()
    vi.doMock('../../src/ui/components/toast', () => ({
      pushToast: (opts: { message: string }) => toastSpy(opts),
    }))

    const mod = await import('../../src/ui/hooks/notifications')
    await mod.showError(long)

    expect(errorSpy).toHaveBeenCalledWith(long)
    expect(infoSpy).toHaveBeenCalled()
    expect(debugSpy).toHaveBeenCalled() // trimmed note
    const arg = toastSpy.mock.calls[0]![0]
    expect(arg.message.length).toBe(80)
    expect(arg.message.endsWith('...')).toBe(true)
  })

  it('shows API error message derived from status', async () => {
    const toastSpy = vi.fn()
    vi.doMock('../../src/ui/components/toast', () => ({
      pushToast: (opts: { message: string }) => toastSpy(opts),
    }))
    const mod = await import('../../src/ui/hooks/notifications')
    await mod.showApiError(500)
    const message = toastSpy.mock.calls[0]![0].message as string
    expect(message.length).toBeGreaterThan(0)
  })
})
