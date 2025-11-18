import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

vi.mock('@mirohq/design-system', () => {
  const Callout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  Callout.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  Callout.Description = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  Callout.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...properties }, reference) => (
      <button ref={reference} type="button" {...properties}>
        {children}
      </button>
    ),
  )

  Button.IconSlot = ({ children }: { children: React.ReactNode }) => <span>{children}</span>
  Button.Label = ({ children }: { children: React.ReactNode }) => <span>{children}</span>

  return { Callout, Button }
})

import { ToastContainer, pushToast } from '../../src/ui/components/toast'

describe('ToastContainer', () => {
  it('renders pushed toasts and auto-dismisses them', async () => {
    vi.useFakeTimers()
    render(<ToastContainer />)
    // Allow effect subscription to register before pushing
    await Promise.resolve()
    act(() => pushToast({ message: 'Hello world' }))
    expect(screen.getByText('Hello world')).toBeTruthy()

    // Fast-forward the 5s auto-dismiss timer within act to flush state updates
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Hello world')).toBeNull()

    vi.useRealTimers()
  })

  it('invokes action callback and removes toast on click', async () => {
    render(<ToastContainer />)
    await Promise.resolve()
    const cb = vi.fn()
    act(() => pushToast({ message: 'Click me', action: { label: 'Do', callback: cb } }))
    expect(screen.getByText('Click me')).toBeTruthy()
    const button = screen.getByText('Do')
    act(() => button.click())
    expect(cb).toHaveBeenCalled()
    expect(screen.queryByText('Click me')).toBeNull()
  })
})
// @vitest-environment jsdom
