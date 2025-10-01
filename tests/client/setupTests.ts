import '@testing-library/jest-dom/vitest'

// Minimal ResizeObserver polyfill for components using Radix primitives in tests
class ResizeObserverPolyfill implements ResizeObserver {
  private readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  public observe(_target: Element, _options?: ResizeObserverOptions): void {}

  public unobserve(_target: Element): void {}

  public disconnect(): void {}

  public takeRecords(): ResizeObserverEntry[] {
    return []
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: ResizeObserverPolyfill,
  })
}
