/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import * as grid from '../src/board/grid-tools'
import * as spacing from '../src/board/spacing-tools'
import { ArrangeTab } from '../src/ui/pages/ArrangeTab'

vi.mock('../src/ui/components/Select', () => ({
  Select: ({
    value,
    onChange,
    children,
  }: {
    value?: string
    onChange?: (v: string) => void
    children?: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectOption: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

;(global as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver

beforeEach(() => {
  vi.spyOn(grid, 'applyGridLayout').mockResolvedValue(undefined)
  vi.spyOn(spacing, 'applySpacingLayout').mockResolvedValue(undefined)
})

describe('ArrangeTab', () => {
  test('sort by name toggle shows orientation select', () => {
    render(<ArrangeTab />)
    fireEvent.click(screen.getByLabelText('Sort by name'))
    expect(screen.getByText('Order')).toBeInTheDocument()
  })

  test('apply grid button calls grid layout', () => {
    const spy = vi.spyOn(grid, 'applyGridLayout')
    render(<ArrangeTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Arrange Grid' }))
    expect(spy).toHaveBeenCalled()
  })

  test('group result toggle shows frame title input', () => {
    render(<ArrangeTab />)
    fireEvent.click(screen.getByLabelText('Group items into Frame'))
    expect(screen.getByPlaceholderText('Optional')).toBeInTheDocument()
  })

  test('distribute button calls spacing layout', () => {
    const spy = vi.spyOn(spacing, 'applySpacingLayout')
    render(<ArrangeTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Distribute' }))
    expect(spy).toHaveBeenCalled()
  })

  test('updates axis and spacing before distributing', () => {
    const spy = vi.spyOn(spacing, 'applySpacingLayout')
    render(<ArrangeTab />)
    const axis = screen.getByText('Axis').parentElement?.querySelector('select')
    const spacingInput = screen.getByText('Spacing').parentElement?.querySelector('input')
    act(() => {
      fireEvent.change(axis as Element, { target: { value: 'y' } })
      fireEvent.change(spacingInput as Element, { target: { value: '30' } })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Distribute' }))
    expect(spy).toHaveBeenCalledWith({ axis: 'y', spacing: 30, mode: 'move' })
  })

  test('orientation select forwards option to grid layout', () => {
    const spy = vi.spyOn(grid, 'applyGridLayout')
    render(<ArrangeTab />)
    fireEvent.click(screen.getByLabelText('Sort by name'))
    const orientation = screen.getByText('Order').parentElement?.querySelector('select')
    act(() => {
      fireEvent.change(orientation as HTMLElement, {
        target: { value: 'vertical' },
      })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Arrange Grid' }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ sortOrientation: 'vertical' }))
  })

  test('shows page help tooltip', async () => {
    render(<ArrangeTab />)
    const helpButton = screen.getByRole('button', { name: 'Help' })
    fireEvent.focus(helpButton)
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Grid and spacing tools')
  })
})
