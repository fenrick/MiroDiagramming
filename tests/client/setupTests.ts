import '@testing-library/jest-dom/vitest'

class StableCSSStyleSheet {
  public cssRules: CSSRuleList | CSSRule[] = []

  public insertRule(): number {
    return 0
  }

  public replaceSync(): void {}
}

;(globalThis as typeof globalThis & { CSSStyleSheet: typeof StableCSSStyleSheet }).CSSStyleSheet =
  StableCSSStyleSheet as unknown as typeof CSSStyleSheet

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

// JSDOM's CSS parser chokes on the `--sxs` custom-property selector injected by
// Stitches/design-system styles. Swallow those rules so components can render
// during tests without failing CSSOM parsing.
if (typeof CSSStyleSheet !== 'undefined') {
  const originalInsertRule = CSSStyleSheet.prototype.insertRule

  CSSStyleSheet.prototype.insertRule = function patchedInsertRule(
    rule: string,
    index?: number,
  ): number {
    if (rule.startsWith('--sxs')) {
      return 0
    }

    try {
      return originalInsertRule.call(this, rule, index)
    } catch (error) {
      if (rule.startsWith('--sxs')) {
        return 0
      }

      throw error
    }
  }
}

if (typeof document !== 'undefined') {
  const documentWithSheets = document as typeof document & {
    adoptedStyleSheets?: CSSStyleSheet[]
  }

  if (!Array.isArray(documentWithSheets.adoptedStyleSheets)) {
    Object.defineProperty(documentWithSheets, 'adoptedStyleSheets', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: [],
    })
  }

  if (
    Array.isArray(documentWithSheets.adoptedStyleSheets) &&
    documentWithSheets.adoptedStyleSheets.length === 0
  ) {
    documentWithSheets.adoptedStyleSheets.push(new CSSStyleSheet())
  }

  const sheetMap = new WeakMap<HTMLStyleElement, CSSStyleSheet>()

  Object.defineProperty(HTMLStyleElement.prototype, 'sheet', {
    configurable: true,
    enumerable: false,
    get() {
      if (!sheetMap.has(this)) {
        sheetMap.set(this, new CSSStyleSheet())
      }

      return sheetMap.get(this)
    },
  })

  Object.defineProperty(HTMLStyleElement.prototype, 'styleSheet', {
    configurable: true,
    enumerable: false,
    get() {
      return (this as HTMLStyleElement & { sheet?: CSSStyleSheet }).sheet
    },
  })
}
