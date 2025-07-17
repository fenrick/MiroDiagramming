/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SelectField } from '../fenrick.miro.ux/src/ui/components/SelectField';
import { SelectOption } from '../fenrick.miro.ux/src/ui/components';

test('renders label and select', () => {
  render(
    <SelectField
      label='Fruit'
      onChange={() => {}}>
      <SelectOption value='apple'>Apple</SelectOption>
    </SelectField>,
  );
  const select = screen.getByLabelText('Fruit');
  expect(select).toBeInTheDocument();
  const label = screen.getByText('Fruit');
  expect(label).toHaveAttribute('for', select.getAttribute('id'));
});
