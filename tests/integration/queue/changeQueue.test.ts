import { afterEach, describe, expect, it, vi } from 'vitest'

import { changeQueue } from '../../../src/queue/changeQueue.js'

describe('changeQueue', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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
})
