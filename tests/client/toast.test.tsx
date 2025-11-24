import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'

import { ToastContainer, pushToast } from '../../src/ui/components/toast'

describe('ToastContainer', () => {
  it('renders pushed toasts and auto-dismisses them', async () => {
    render(<ToastContainer />)
    await Promise.resolve()
    act(() => pushToast({ message: 'Hello world', timeoutMs: 20 }))
    await waitFor(() => expect(screen.getByText('Hello world')).toBeTruthy(), { timeout: 200 })
    await waitFor(() => expect(screen.queryByText('Hello world')).toBeNull(), { timeout: 500 })
  })

  it('invokes action callback and removes toast on click', async () => {
    render(<ToastContainer />)
    await Promise.resolve()
    const cb = vi.fn()
    act(() =>
      pushToast({ message: 'Click me', action: { label: 'Do', callback: cb }, timeoutMs: 1000 }),
    )
    await waitFor(() => expect(screen.getByText('Click me')).toBeTruthy())
    const button = await screen.findByText('Do')
    act(() => button.click())
    expect(cb).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByText('Click me')).toBeNull())
  })
})
// @vitest-environment jsdom
