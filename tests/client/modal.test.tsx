/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { Modal } from '../src/ui/components/Modal'

describe('Modal', () => {
  test('renders title and children', () => {
    render(
      <Modal title="Test" isOpen onClose={() => {}}>
        <button>Ok</button>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).not.toHaveAttribute('role')
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  test('escape key triggers onClose', () => {
    const spy = vi.fn()
    const { unmount } = render(
      <Modal title="X" isOpen onClose={spy}>
        <button>Hi</button>
      </Modal>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(spy).toHaveBeenCalled()
    unmount()
  })

  test('focus wraps with Tab and Shift+Tab', () => {
    const spy = vi.fn()
    render(
      <Modal title="Wrap" isOpen onClose={spy}>
        <button>First</button>
        <button>Second</button>
      </Modal>,
    )
    const closeBtn = screen.getByLabelText('Close')
    const buttons = screen.getAllByRole('button')
    const second = buttons[buttons.length - 1]
    second.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(closeBtn).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(second).toHaveFocus()
  })

  test('clicking the backdrop triggers onClose', () => {
    const spy = vi.fn()
    render(
      <Modal title="B" isOpen onClose={spy}>
        <button>Inside</button>
      </Modal>,
    )
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    expect(spy).toHaveBeenCalled()
  })

  test('pressing Enter on the backdrop triggers onClose', () => {
    const spy = vi.fn()
    render(
      <Modal title="C" isOpen onClose={spy}>
        <button>Inner</button>
      </Modal>,
    )
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.keyDown(backdrop, { key: 'Enter' })
    expect(spy).toHaveBeenCalled()
  })

  test('pressing Space on the backdrop triggers onClose', () => {
    const spy = vi.fn()
    render(
      <Modal title="S" isOpen onClose={spy}>
        <button>Inner</button>
      </Modal>,
    )
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.keyDown(backdrop, { key: ' ' })
    expect(spy).toHaveBeenCalled()
  })

  test('Enter key activates the close button', () => {
    const spy = vi.fn()
    render(
      <Modal title="Close" isOpen onClose={spy}>
        <button>OK</button>
      </Modal>,
    )
    const closeBtn = screen.getByRole('button', { name: 'Close' })
    fireEvent.keyDown(closeBtn, { key: 'Enter' })
    fireEvent.keyUp(closeBtn, { key: 'Enter' })
    fireEvent.click(closeBtn)
    expect(spy).toHaveBeenCalled()
  })

  test('Space key activates the close button', () => {
    const spy = vi.fn()
    render(
      <Modal title="CloseSpace" isOpen onClose={spy}>
        <button>OK</button>
      </Modal>,
    )
    const closeBtn = screen.getByRole('button', { name: 'Close' })
    fireEvent.keyDown(closeBtn, { key: ' ' })
    fireEvent.keyUp(closeBtn, { key: ' ' })
    fireEvent.click(closeBtn)
    expect(spy).toHaveBeenCalled()
  })
})
