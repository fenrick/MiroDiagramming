import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { ToastContainer, pushToast } from '../../src/ui/components/Toast'

describe('ToastContainer', () => {
  it('renders pushed toasts and auto-dismisses them', async () => {
    vi.useFakeTimers()
    render(<ToastContainer />)

    pushToast({ message: 'Hello world' })
    expect(await screen.findByText('Hello world')).toBeInTheDocument()

    // Fast-forward the 5s auto-dismiss timer
    vi.advanceTimersByTime(5000)

    // Allow effects to flush
    await Promise.resolve()

    expect(screen.queryByText('Hello world')).toBeNull()

    vi.useRealTimers()
  })
})
