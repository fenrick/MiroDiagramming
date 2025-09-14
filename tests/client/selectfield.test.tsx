/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { SelectOption } from '../src/ui/components'
import { SelectField } from '../src/ui/components/SelectField'

test('renders label and select', () => {
  render(
    <SelectField label="Fruit" onChange={() => {}}>
      <SelectOption value="apple">Apple</SelectOption>
    </SelectField>,
  )
  const select = screen.getByLabelText('Fruit')
  expect(select).toBeInTheDocument()
  const label = screen.getByText('Fruit')
  expect(label).toHaveAttribute('for', select.getAttribute('id'))
})
