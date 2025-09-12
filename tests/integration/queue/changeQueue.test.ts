import { afterEach, describe, expect, it, vi } from 'vitest'

import { changeQueue } from '../../../src/queue/changeQueue.js'

describe('changeQueue', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    ;(changeQueue as any).q = []
    changeQueue.configure({ concurrency: 2, baseDelayMs: 250, maxDelayMs: 5000, maxRetries: 5 })
    changeQueue.setLogger(undefined as any)
  })

  it('supports enqueue and size/inFlight accounting', () => {
    const startSize = changeQueue.size()
    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'n', data: {} })
    expect(changeQueue.size()).toBe(startSize + 1)
  })

  it('start is a no-op in test env and stop logs', () => {
    const info = vi.fn()
    changeQueue.setLogger({ info, warn: vi.fn(), error: vi.fn() } as any)
    changeQueue.start(1)
    // no workers started in tests; ensure stop logs queued length
    changeQueue.stop()
    expect(info).toHaveBeenCalled()
  })

  it('clamps configuration values to minimums', () => {
    changeQueue.configure({ concurrency: 0, baseDelayMs: 0, maxDelayMs: 1, maxRetries: 0 })
    expect((changeQueue as any).defaultConcurrency).toBe(1)
    expect((changeQueue as any).baseDelayMs).toBe(1)
    expect((changeQueue as any).maxDelayMs).toBe(1)
    expect((changeQueue as any).defaultMaxRetries).toBe(1)
  })

  it('retries failing tasks then drops after max retries', async () => {
    vi.useFakeTimers()
    const warn = vi.fn()
    const error = vi.fn()
    changeQueue.setLogger({ info: vi.fn(), warn, error } as any)
    ;(changeQueue as any).miro = { createNode: vi.fn().mockRejectedValue(new Error('nope')) }
    vi.spyOn(Math, 'random').mockReturnValue(0)
    changeQueue.configure({ baseDelayMs: 1, maxDelayMs: 2, maxRetries: 2 })
    const task = { type: 'create_node', userId: 'u', nodeId: 'n', data: {} }
    await (changeQueue as any).process(task)
    await vi.runAllTimersAsync()
    expect(warn).toHaveBeenCalledTimes(1)
    const retry1 = (changeQueue as any).q.shift()
    await (changeQueue as any).process(retry1)
    await vi.runAllTimersAsync()
    expect(warn).toHaveBeenCalledTimes(2)
    const retry2 = (changeQueue as any).q.shift()
    await (changeQueue as any).process(retry2)
    expect(error).toHaveBeenCalledTimes(1)
    expect(changeQueue.size()).toBe(0)
    vi.useRealTimers()
  })
})
