// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../src/core/mermaid', async () => {
  const actual =
    await vi.importActual<typeof import('../../src/core/mermaid')>('../../src/core/mermaid')
  return {
    ...actual,
    isMermaidEnabled: vi.fn(() => true),
  }
})

import { isMermaidEnabled } from '../../src/core/mermaid'
import { DiagramsTab } from '../../src/ui/pages/diagrams-tab'

const STORAGE_KEY = 'miro.diagrams.last-sub-tab'
const isMermaidEnabledMock = vi.mocked(isMermaidEnabled)

describe('DiagramsTab', () => {
  beforeEach(() => {
    window.localStorage.clear()
    isMermaidEnabledMock.mockReturnValue(true)
  })

  afterEach(() => {
    window.localStorage.clear()
    isMermaidEnabledMock.mockClear()
  })

  it('restores the stored sub tab when it is still available', () => {
    window.localStorage.setItem(STORAGE_KEY, 'mermaid')

    const { getByRole } = render(<DiagramsTab />)

    expect(getByRole('tab', { name: 'Mermaid' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ignores stored tabs that are hidden by feature flags', () => {
    isMermaidEnabledMock.mockReturnValue(false)
    window.localStorage.setItem(STORAGE_KEY, 'mermaid')

    const { getByRole, queryByRole } = render(<DiagramsTab />)

    expect(queryByRole('tab', { name: 'Mermaid' })).toBeNull()
    expect(getByRole('tab', { name: 'Structured' })).toHaveAttribute('aria-selected', 'true')
  })

  it('persists user changes to the selected tab', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()

    const { getByRole } = render(<DiagramsTab />)
    await user.click(getByRole('tab', { name: 'Layout Engine' }))

    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, 'layout')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('layout')
    expect(getByRole('tab', { name: 'Layout Engine' })).toHaveAttribute('aria-selected', 'true')
    setItemSpy.mockRestore()
  })
})
