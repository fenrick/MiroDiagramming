import '@testing-library/jest-dom/vitest'

// Minimal ResizeObserver polyfill for components using Radix primitives in tests
class RO {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
// @ts-expect-error test env polyfill
globalThis.ResizeObserver = globalThis.ResizeObserver ?? RO
