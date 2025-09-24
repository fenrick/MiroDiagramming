import { describe, it, expect, vi } from 'vitest'

import { handleFileDrop } from '../../src/ui/pages/StructuredTab'

describe('StructuredTab handleFileDrop', () => {
  it('queues first dropped file and clears error', () => {
    const file = new File(['{}'], 'graph.json', { type: 'application/json' })
    const setQueue = vi.fn()
    const setError = vi.fn()

    handleFileDrop([file], setQueue, setError)

    expect(setQueue).toHaveBeenCalledWith([file])
    expect(setError).toHaveBeenCalledWith(null)
  })

  it('ignores empty drops', () => {
    const setQueue = vi.fn()
    const setError = vi.fn()

    handleFileDrop([], setQueue, setError)

    expect(setQueue).not.toHaveBeenCalled()
    expect(setError).not.toHaveBeenCalled()
  })
})
