/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { ToolsTab } from '../src/ui/pages/ToolsTab'

vi.mock('@mirohq/design-system', async () => {
  const React = await import('react')
  const styled = (tag: any, _styles?: any) =>
    React.forwardRef<any, any>(function StyledMock(props, ref) {
      const Comp = tag as React.ElementType
      return React.createElement(Comp, { ...props, ref, 'data-styled': '1' })
    })
  const Tabs = ({ children, onChange }: any) => (
    <div>{React.Children.map(children, (c) => React.cloneElement(c, { onChange }))}</div>
  )
  Tabs.List = ({ children, ...props }: any) => (
    <div role="tablist" {...props}>
      {children}
    </div>
  )
  Tabs.Trigger = ({ value, children, onChange }: any) => (
    <button role="tab" data-value={value} onKeyDown={(e) => e.key === 'Enter' && onChange?.(value)}>
      {children}
    </button>
  )
  return { Tabs, styled, Callout: ({ title }: { title?: string }) => <div title={title} /> }
})

test('Enter on tab trigger changes sub-tab', () => {
  render(<ToolsTab />)
  const arrangeTab = screen.getByRole('tab', { name: 'Arrange' })
  fireEvent.keyDown(arrangeTab, { key: 'Enter' })
  expect(screen.getByText(/Arrange/i)).toBeInTheDocument()
})
