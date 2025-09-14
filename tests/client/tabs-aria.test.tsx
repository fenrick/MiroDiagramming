/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { ToolsTab } from '../src/ui/pages/ToolsTab'
import { DiagramsTab } from '../src/ui/pages/DiagramsTab'

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
    <button role="tab" onClick={() => onChange?.(value)}>
      {children}
    </button>
  )
  const Callout = ({ title, description }: { title?: string; description?: string }) => (
    <div role="alert" title={title} description={description} />
  )
  return { Tabs, styled, Callout }
})

test('ToolsTab tablist has aria-label', () => {
  render(<ToolsTab />)
  expect(screen.getByRole('tablist', { name: /tool categories/i })).toBeInTheDocument()
})

test('DiagramsTab tablist has aria-label', () => {
  render(<DiagramsTab />)
  expect(screen.getByRole('tablist', { name: /diagram tools/i })).toBeInTheDocument()
})
