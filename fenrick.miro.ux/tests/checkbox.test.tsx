/**
 * Integration test for the Checkbox component.
 *
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '../src/ui/components/Checkbox';

test('renders label connected via htmlFor', () => {
  render(
    <Checkbox
      label='Option'
      value={false}
      onChange={() => {}}
    />,
  );
  const control = screen.getByRole('switch', { name: 'Option' });
  const label = screen.getByText('Option').closest('label');
  expect(label).toHaveAttribute('for', control.getAttribute('id'));
});

test('triggers onChange when toggled on', () => {
  const handler = jest.fn();
  render(
    <Checkbox
      label='Option'
      value={false}
      onChange={handler}
    />,
  );
  const control = screen.getByRole('switch', { name: 'Option' });
  fireEvent.click(control);
  expect(handler).toHaveBeenCalledWith(true);
});

test('triggers onChange when toggled off', () => {
  const handler = jest.fn();
  render(
    <Checkbox
      label='Option'
      value={true}
      onChange={handler}
    />,
  );
  const control = screen.getByRole('switch', { name: 'Option' });
  fireEvent.click(control);
  expect(handler).toHaveBeenCalledWith(false);
});
