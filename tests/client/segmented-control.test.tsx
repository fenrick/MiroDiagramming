import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { SegmentedControl } from '../src/ui/components/SegmentedControl'

describe('SegmentedControl', () =>
  test('click triggers onChange with value', () => {
    const handler = vi.fn()
    const options = [
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
    ]
    render(<SegmentedControl value="1" onChange={handler} options={options} />)
    const btn = screen.getByRole('button', { name: 'Two' })
    fireEvent.click(btn)
    expect(handler).toHaveBeenCalledWith('2')
  }))
