import { afterAll, afterEach, vi } from 'vitest'

// alias vi global to vitest for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).vi = vi

// Silence noisy console output from third-party libraries during tests
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Reset mocks and clean up globals after every test
afterEach(() => {
  vi.restoreAllMocks()
  delete (globalThis as { miro?: unknown }).miro
})

// Provide a minimal PointerEvent implementation for jsdom
if (typeof window !== 'undefined' && !('PointerEvent' in window)) {
  class PointerEvent extends MouseEvent {}

  window.PointerEvent = PointerEvent as typeof globalThis.PointerEvent
  ;(globalThis as unknown as { PointerEvent: typeof window.PointerEvent }).PointerEvent =
    PointerEvent as unknown as typeof window.PointerEvent
}

afterAll(() => {
  logSpy.mockRestore()
  errorSpy.mockRestore()
})
