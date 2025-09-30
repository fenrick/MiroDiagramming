import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockFunction = ReturnType<typeof vi.fn>

interface MockedMermaid {
  initialize: MockFunction
  mermaidAPI?: {
    reset?: MockFunction
  }
}

const mermaidMock: MockedMermaid = {
  initialize: vi.fn(),
  mermaidAPI: {
    reset: vi.fn(),
  },
}

vi.mock('mermaid', () => ({
  __esModule: true,
  default: mermaidMock,
}))

describe('mermaid runtime configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    mermaidMock.initialize = vi.fn()
    mermaidMock.mermaidAPI = { reset: vi.fn() }
  })

  it('initializes Mermaid once and resets through the runtime API', async () => {
    const { ensureMermaidInitialized, resetMermaid } = await import('../../src/core/mermaid/config')

    ensureMermaidInitialized({ theme: 'forest' })
    ensureMermaidInitialized({ theme: 'forest' })

    expect(mermaidMock.initialize).toHaveBeenCalledTimes(1)
    expect(mermaidMock.initialize).toHaveBeenCalledWith({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'forest',
      flowchart: { htmlLabels: false },
    })

    resetMermaid()
    expect(mermaidMock.mermaidAPI?.reset).toHaveBeenCalledTimes(1)

    ensureMermaidInitialized()
    expect(mermaidMock.initialize).toHaveBeenCalledTimes(2)
  })

  it('throws when the runtime API is missing', async () => {
    mermaidMock.mermaidAPI = undefined

    const { resetMermaid } = await import('../../src/core/mermaid/config')

    expect(() => {
      resetMermaid()
    }).toThrowError(new TypeError('Mermaid runtime API is unavailable'))
  })

  it('throws when the runtime API does not expose reset()', async () => {
    mermaidMock.mermaidAPI = { reset: undefined }

    const { resetMermaid } = await import('../../src/core/mermaid/config')

    expect(() => {
      resetMermaid()
    }).toThrowError(new TypeError('Mermaid runtime API does not expose reset()'))
  })
})
