import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { App } from '../../src/app/App'

describe('App a11y', () => {
  it('does not set tabIndex on non-interactive content region', async () => {
    render(<App />)
    // Some panels show an intro screen; open the app if a start button exists
    const start = screen.queryByTestId('start-button')
    if (start) fireEvent.click(start)
    const region = await screen.findByLabelText('Panel content')
    expect(region.getAttribute('tabindex')).toBeNull()
  })
})
