import { afterEach, describe, expect, it, vi } from 'vitest'

import { changeQueue, InMemoryChangeQueue, createNodeTask } from '../../../src/queue/changeQueue.js'

describe('changeQueue', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await changeQueue.stop({ drain: false })
    ;(changeQueue as any).q = []
    ;(changeQueue as any).active = 0
    ;(changeQueue as any).running = false
    ;(changeQueue as any).draining = false
    ;(changeQueue as any).accepting = true
    ;(changeQueue as any).drainWaiters = []
    ;(changeQueue as any).stopPromise = null
    changeQueue.configure({
      concurrency: 2,
      baseDelayMs: 250,
      maxDelayMs: 5000,
      maxRetries: 5,
      warnLength: 0,
    })
    changeQueue.setLogger(undefined as any)
  })

  it('supports enqueue and size/inFlight accounting', () => {
    const startSize = changeQueue.size()
    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'n', data: {} })
    expect(changeQueue.size()).toBe(startSize + 1)
  })

  it('start is a no-op in test env and stop logs', async () => {
    const info = vi.fn()
    changeQueue.setLogger({ info, warn: vi.fn(), error: vi.fn() } as any)
    changeQueue.start(1)
    // no workers started in tests; ensure stop logs queued length
    await changeQueue.stop({ drain: false })
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

  it('warns when queue depth crosses the configured threshold and logs recovery', () => {
    const info = vi.fn()
    const warn = vi.fn()
    changeQueue.setLogger({ info, warn, error: vi.fn() } as any)
    changeQueue.configure({ warnLength: 2 })

    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'a', data: {} })
    expect(info).toHaveBeenLastCalledWith(
      expect.objectContaining({ event: 'queue.depth', queued: 1, trigger: 'enqueue' }),
      expect.any(String),
    )

    info.mockClear()
    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'b', data: {} })
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'queue.backpressure',
        queued: 2,
        threshold: 2,
        trigger: 'enqueue',
      }),
      expect.any(String),
    )

    // Simulate worker pulling one task off the queue
    ;(changeQueue as any).q.shift()
    ;(changeQueue as any).active = 1
    info.mockClear()
    ;(changeQueue as any).emitDepthSample('dequeue')
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'queue.backpressure.recovered',
        queued: 1,
        threshold: 2,
        trigger: 'dequeue',
      }),
      expect.any(String),
    )
    expect((changeQueue as any).warnActive).toBe(false)
  })

  it('disables warnings when warnLength is non-positive', () => {
    const info = vi.fn()
    const warn = vi.fn()
    changeQueue.setLogger({ info, warn, error: vi.fn() } as any)
    changeQueue.configure({ warnLength: 0 })

    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'a', data: {} })
    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'b', data: {} })
    expect(warn).not.toHaveBeenCalled()
    expect(info).toHaveBeenCalled()
  })

  it('rejects new tasks once shutdown begins', async () => {
    const warn = vi.fn()
    changeQueue.setLogger({ info: vi.fn(), warn, error: vi.fn() } as any)

    await changeQueue.stop({ drain: false })

    changeQueue.enqueue({ type: 'create_node', userId: 'u', nodeId: 'late', data: {} })
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'queue.enqueue.rejected', nodeId: 'late' }),
      expect.any(String),
    )
    expect(changeQueue.size()).toBe(0)
  })

  it('waits for in-flight tasks to finish before resolving stop', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const queue = new InMemoryChangeQueue()
    const info = vi.fn()
    queue.setLogger({ info, warn: vi.fn(), error: vi.fn() } as any)
    queue.configure({ concurrency: 1 })
    let resolveTask: () => void = () => {}
    const taskDone = new Promise<void>((resolve) => {
      resolveTask = resolve
    })
    ;(queue as any).miro = {
      createNode: vi.fn().mockImplementation(() => taskDone),
    }

    try {
      queue.start(1)
      queue.enqueue(createNodeTask('user', 'node', {}))

      const stopPromise = queue.stop({ timeoutMs: 250 })

      // Allow the worker loop to pick up the task before awaiting stop
      for (let i = 0; i < 10 && queue.inFlight() === 0; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
      expect(queue.inFlight()).toBe(1)

      let settled = false
      void stopPromise.then(() => {
        settled = true
      })

      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(settled).toBe(false)

      resolveTask()
      await stopPromise
      expect(queue.size()).toBe(0)
      expect(queue.inFlight()).toBe(0)
      expect(
        info.mock.calls.some(
          ([payload]) => (payload as { event?: string } | undefined)?.event === 'task.processed',
        ),
      ).toBe(true)
    } finally {
      await queue.stop({ drain: false })
      process.env.NODE_ENV = originalEnv
    }
  })
})
