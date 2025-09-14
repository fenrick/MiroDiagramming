import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'

import { Skeleton } from '../../src/frontend/ui/components/Skeleton'

describe('Skeleton', () => {
  test('renders placeholder block', () => {
    render(<Skeleton data-testid="sk" />)
    expect(screen.getByTestId('sk')).toBeInTheDocument()
  })
})
