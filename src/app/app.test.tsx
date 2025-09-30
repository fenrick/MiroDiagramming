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
    const firstTab = tabs[0]
    const label = (firstTab.textContent || '').trim()
    expect(firstTab).toHaveAttribute('aria-label', label)
  })

  it('does not add tabIndex on non-interactive content region', async () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('start-button'))
    const region = await screen.findByLabelText('Panel content')
    expect(region.getAttribute('tabindex')).toBeNull()
  })
})
