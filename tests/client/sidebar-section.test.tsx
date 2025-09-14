/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { SidebarSection } from '../src/ui/components/SidebarSection'

test('SidebarSection renders a heading and content', () => {
  render(
    <SidebarSection title="Section Title" description="Short description">
      <div>Inner content</div>
    </SidebarSection>,
  )
  expect(screen.getByRole('heading', { name: 'Section Title' })).toBeInTheDocument()
  expect(screen.getByText('Short description')).toBeInTheDocument()
  expect(screen.getByText('Inner content')).toBeInTheDocument()
})
