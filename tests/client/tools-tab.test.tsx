// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToolsTab } from '../../src/ui/pages/tools-tab'

const STORAGE_KEY = 'miro.tools.last-sub-tab'

describe('ToolsTab', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
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
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()

    const { getByRole } = render(<ToolsTab />)
    await user.click(getByRole('tab', { name: 'Frames' }))

    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, 'frames')
    expect(getByRole('tab', { name: 'Frames' })).toHaveAttribute('aria-selected', 'true')
    setItemSpy.mockRestore()
  })
})
