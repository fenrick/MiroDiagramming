/** @vitest-environment jsdom */
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { ScrollArea } from '../src/ui/ScrollArea'

describe('ScrollArea', () => {
  it('enables vertical scrolling with padding', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>,
    )
    const wrapper = container.firstChild as HTMLDivElement
    expect(wrapper).toHaveStyle({
      flex: '1',
      overflowY: 'auto',
      padding: 'var(--space-200)',
    })
  })
})
