/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { ToolsTab } from '../src/ui/pages/ToolsTab'
import { DiagramsTab } from '../src/ui/pages/DiagramsTab'

test('ToolsTab tablist has aria-label', () => {
  render(<ToolsTab />)
  expect(screen.getByRole('tablist', { name: /tool categories/i })).toBeInTheDocument()
})

test('DiagramsTab tablist has aria-label', () => {
  render(<DiagramsTab />)
  expect(screen.getByRole('tablist', { name: /diagram tools/i })).toBeInTheDocument()
})
