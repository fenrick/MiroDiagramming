import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { App } from './app'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('exposes full tab labels via aria-label', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('start-button'))
    const tabs = await screen.findAllByRole('tab')
    const firstTab = tabs[0] as HTMLElement | undefined
    expect(firstTab).toBeDefined()
    if (!firstTab) {
      throw new Error('Expected at least one tab')
    }
    const rawText = firstTab.textContent
    const label = typeof rawText === 'string' ? rawText.trim() : ''
    expect(firstTab).toHaveAttribute('aria-label', label)
  })

  it('does not add tabIndex on non-interactive content region', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('start-button'))
    const region = await screen.findByLabelText('Panel content')
    expect(region.getAttribute('tabindex')).toBeNull()
  })
})
