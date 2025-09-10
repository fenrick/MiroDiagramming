/** @vitest-environment jsdom */
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { StickyActions } from '../src/ui/StickyActions'

describe('StickyActions', () => {
  it('positions actions at the bottom', () => {
    const { container } = render(
      <StickyActions>
        <div>Save</div>
      </StickyActions>,
    )
    const wrapper = container.firstChild as HTMLDivElement
    expect(wrapper).toHaveStyle({
      position: 'sticky',
      bottom: '0px',
      background: 'var(--mds-surface, #fff)',
      paddingTop: 'var(--space-200)',
      paddingBottom: 'var(--space-200)',
    })
  })
})
