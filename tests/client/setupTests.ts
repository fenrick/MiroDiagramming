import { afterAll, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// alias vi global to vitest for compatibility
;(globalThis as any).vi = vi

// Silence noisy console output from third-party libraries during tests
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Provide a minimal default miro global for tests that call apiFetch
beforeEach(() => {
  // Only install a default stub if a test hasn't already provided one.
  if (!(globalThis as any).miro) {
    ;(globalThis as any).miro = {
      board: {
        getUserInfo: vi.fn().mockResolvedValue({ id: 'test-user' }),
      },
    }
  }
})

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
