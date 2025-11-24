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
    window.localStorage.clear?.()
    if (typeof window.localStorage.clear !== 'function') {
      window.localStorage.clear = () => {
        for (const key of Object.keys(window.localStorage)) {
          window.localStorage.removeItem(key)
        }
      }
    }
    isMermaidEnabledMock.mockReturnValue(true)
  })

  afterEach(() => {
    window.localStorage.clear?.()
    isMermaidEnabledMock.mockClear()
  })

  it('restores the stored sub tab when it is still available', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'mermaid')

    const { findByRole } = render(<DiagramsTab />)

    const tab = await findByRole('tab', { name: 'Mermaid' })
    expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  it('ignores stored tabs that are hidden by feature flags', () => {
    isMermaidEnabledMock.mockReturnValue(false)
    window.localStorage.setItem(STORAGE_KEY, 'mermaid')

    const { getByRole, queryByRole } = render(<DiagramsTab />)

    expect(queryByRole('tab', { name: 'Mermaid' })).toBeNull()
    expect(getByRole('tab', { name: 'Structured' })).toHaveAttribute('aria-selected', 'true')
  })

  it('persists user changes to the selected tab', async () => {
    const user = userEvent.setup()

    const { getByRole } = render(<DiagramsTab />)
    await user.click(getByRole('tab', { name: 'Layout Engine' }))

    expect(window.localStorage.getItem(STORAGE_KEY)?.replaceAll('"', '')).toBe('layout')
    expect(getByRole('tab', { name: 'Layout Engine' })).toHaveAttribute('aria-selected', 'true')
  })
})
