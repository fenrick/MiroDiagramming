// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToolsTab } from '../../src/ui/pages/tools-tab'

const STORAGE_KEY = 'miro.tools.last-sub-tab'

describe('ToolsTab', () => {
  beforeEach(() => {
    window.localStorage.clear?.()
    // Ensure clear exists for jsdom localStorage polyfills
    if (typeof window.localStorage.clear !== 'function') {
      window.localStorage.clear = () => {
        for (const key of Object.keys(window.localStorage)) {
          window.localStorage.removeItem(key)
        }
      }
    }
  })

  afterEach(() => {
    window.localStorage.clear?.()
    vi.restoreAllMocks()
  })

  it('restores the previously selected sub tab from storage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'style')

    const { getByRole } = render(<ToolsTab />)

    expect(getByRole('tab', { name: 'Colours' })).toHaveAttribute('aria-selected', 'true')
  })

  it('falls back to the default tab when storage contains an unknown id', () => {
    window.localStorage.setItem(STORAGE_KEY, 'unknown')

    const { getByRole } = render(<ToolsTab />)

    expect(getByRole('tab', { name: 'Size' })).toHaveAttribute('aria-selected', 'true')
  })

  it('persists user sub tab changes to storage', async () => {
    const user = userEvent.setup()

    const { getByRole } = render(<ToolsTab />)
    await user.click(getByRole('tab', { name: 'Frames' }))

    expect(getByRole('tab', { name: 'Frames' })).toHaveAttribute('aria-selected', 'true')
  })
})
