// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

// Mock design system primitives to avoid CSS shorthands not supported by jsdom

// Mock UI components that style heavily
vi.mock('../../src/ui/components', async () => {
  const React = (await import('react')).default
  const P = ({ children }: any) => React.createElement('div', null, children)
  const Opt = ({ children, ...props }: any) => React.createElement('option', props, children)
  const Sel = ({ children, ...props }: any) => React.createElement('select', props, children)
  const Btn = ({ children, ...props }: any) => React.createElement('button', props, children)
  return {
    Button: Btn,
    ButtonToolbar: P,
    Paragraph: ({ children }: any) => React.createElement('p', null, children),
    Checkbox: ({ label, ...rest }: any) =>
      React.createElement(
        'label',
        null,
        label || '',
        React.createElement('input', { type: 'checkbox', ...rest }),
      ),
    DroppedFileList: P,
    EmptyState: ({ title, description }: any) =>
      React.createElement('div', null, title, description),
    TextareaField: ({ label, value, onValueChange, ...rest }: any) =>
      React.createElement(
        'label',
        null,
        label,
        React.createElement('textarea', {
          value,
          onChange: (e: any) => onValueChange?.(e.target.value),
          ...rest,
        }),
      ),
    SelectField: Sel,
    SelectOption: Opt,
    SidebarSection: ({ title, children }: any) =>
      React.createElement('section', null, React.createElement('h2', null, title), children),
    Skeleton: () => React.createElement('div', null, 'skeleton'),
    InfoCallout: ({ children }: any) => React.createElement('div', null, children),
    JsonDropZone: ({ children }: any) => React.createElement('div', null, children),
    PageHelp: ({ content }: any) => React.createElement('div', null, content),
    TabPanel: ({ children }: any) => React.createElement('div', null, children),
  }
})

// Mock direct component imports used by pages
vi.mock('../../src/ui/components/button', async () => {
  const React = (await import('react')).default
  return { Button: (p: any) => React.createElement('button', p, p.children) }
})
vi.mock('../../src/ui/components/json-drop-zone', async () => {
  const React = (await import('react')).default
  return { JsonDropZone: (p: any) => React.createElement('div', null, 'drop', p.children) }
})
vi.mock('../../src/ui/components/page-help', async () => {
  const React = (await import('react')).default
  return { PageHelp: (p: any) => React.createElement('div', null, p.content) }
})
vi.mock('../../src/ui/components/tab-panel', async () => {
  const React = (await import('react')).default
  // Drop tabId to avoid React unknown prop warning in jsdom
  return {
    TabPanel: ({ tabId: _tabId, children, ...rest }: any) =>
      React.createElement('div', rest, children),
  }
})

describe('Heavy pages smoke render with mocks', () => {
  it('renders Cards/Diagrams/Structured tabs', async () => {
    const { CardsTabV2: CardsTab } = await import('../../src/ui/pages/cards-tab.v2')
    const { DiagramsTab } = await import('../../src/ui/pages/diagrams-tab')
    const { StructuredTabV2: StructuredTab } = await import('../../src/ui/pages/structured-tab.v2')

    const r1 = render(React.createElement(CardsTab))
    expect(r1.container).toBeTruthy()
    const r2 = render(React.createElement(DiagramsTab))
    expect(r2.container).toBeTruthy()
    const r3 = render(React.createElement(StructuredTab))
    expect(r3.container).toBeTruthy()
  })
})
