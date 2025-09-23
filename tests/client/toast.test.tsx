import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'

import { ToastContainer, pushToast } from '../../src/ui/components/Toast'

describe('ToastContainer', () => {
  it('renders pushed toasts and auto-dismisses them', async () => {
    vi.useFakeTimers()
    render(<ToastContainer />)

    act(() => pushToast({ message: 'Hello world' }))
    expect(screen.getByText('Hello world')).toBeInTheDocument()

    // Fast-forward the 5s auto-dismiss timer and allow React state to settle
    vi.advanceTimersByTime(5000)
    await waitFor(() => expect(screen.queryByText('Hello world')).toBeNull())

    vi.useRealTimers()
  })
})
