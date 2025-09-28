import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { useFocusTrap } from '../../src/core/hooks/use-focus-trap'

function TrapHarness({ active, onClose }: { active: boolean; onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(active, onClose)
  return (
    <div ref={ref} data-testid="trap">
      <button>One</button>
      <button>Two</button>
      <button>Three</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('cycles focus with Tab/Shift+Tab and closes on Escape', () => {
    const onClose = vi.fn()
    const { getByTestId, getByText } = render(<TrapHarness active={true} onClose={onClose} />)
    const container = getByTestId('trap')

    // Initial focus moves to first button
    expect(document.activeElement?.textContent).toBe('One')

    // Tab moves forward
    fireEvent.keyDown(container, { key: 'Tab' })
    expect(document.activeElement?.textContent).toBe('Two')

    // Shift+Tab moves backward
    fireEvent.keyDown(container, { key: 'Tab', shiftKey: true })
    expect(document.activeElement?.textContent).toBe('One')

    // Escape calls onClose
    fireEvent.keyDown(container, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()

    // Move focus explicitly to the second button
    ;(getByText('Two') as HTMLButtonElement).focus()
    fireEvent.keyDown(container, { key: 'Tab' })
    expect(document.activeElement?.textContent).toBe('Three')
  })
})
// @vitest-environment jsdom
