// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'

vi.mock('../../src/ui/components/Toast', () => ({
  pushToast: vi.fn(),
}))

import { useOptimisticOps } from '../../src/core/hooks/useOptimisticOps'
import { pushToast } from '../../src/ui/components/Toast'

function Harness({ op }: { op: () => Promise<void> }) {
  return <button onClick={() => void op()}>Run</button>
}

describe('useOptimisticOps', () => {
  it('runs apply and commit on success', async () => {
    const apply = vi.fn()
    const commit = vi.fn().mockResolvedValue(undefined)
    const rollback = vi.fn().mockResolvedValue(undefined)

    function Wrapper() {
      const enqueue = useOptimisticOps()
      return <Harness op={() => enqueue({ apply, commit, rollback })} />
    }

    const { getAllByText } = render(<Wrapper />)
    fireEvent.click(getAllByText('Run')[0]!)
    // allow promises to flush
    await Promise.resolve()

    expect(apply).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(1)
    expect(rollback).not.toHaveBeenCalled()
    expect(pushToast).not.toHaveBeenCalled()
  })

  it('rolls back and shows toast on failure', async () => {
    vi.useFakeTimers()
    const apply = vi.fn()
    const commit = vi.fn().mockRejectedValue(new Error('fail'))
    const rollback = vi.fn()

    function Wrapper() {
      const enqueue = useOptimisticOps()
      return <Harness op={() => enqueue({ apply, commit, rollback })} />
    }

    const { getAllByText } = render(<Wrapper />)
    fireEvent.click(getAllByText('Run')[0]!)
    // advance wait(150) timer and flush
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    // allow any microtasks post-timer
    await Promise.resolve()
    expect(apply).toHaveBeenCalledTimes(1)
    expect(rollback).toHaveBeenCalledTimes(1)
    expect(pushToast).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
