/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { EmptyState } from '../src/ui/components/EmptyState'

test('EmptyState announces status politely', () => {
  render(<EmptyState title="Nothing here" description="Try adding items" />)
  const region = screen.getByRole('status')
  expect(region).toBeInTheDocument()
  expect(region).toHaveAttribute('aria-live', 'polite')
  // Callout may not render the title as visible text; check alert exists
  const alert = screen.getByRole('alert')
  expect(alert).toHaveAttribute('title', 'Nothing here')
})
