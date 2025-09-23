import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

import { ToastContainer, pushToast } from '../../src/ui/components/Toast'

describe('ToastContainer', () => {
  it('renders pushed toasts and auto-dismisses them', async () => {
    vi.useFakeTimers()
    render(<ToastContainer />)
    // Allow effect subscription to register before pushing
    await Promise.resolve()
    act(() => pushToast({ message: 'Hello world' }))
    expect(screen.getByText('Hello world')).toBeInTheDocument()

    // Fast-forward the 5s auto-dismiss timer within act to flush state updates
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Hello world')).toBeNull()

    vi.useRealTimers()
  })
})
