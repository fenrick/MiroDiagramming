/**
 * Integration test for the Checkbox component.
 *
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '../src/ui/components/legacy/Checkbox';

test('Checkbox renders span for Mirotone styling', () => {
  render(
    <Checkbox
      label='Option'
      value={false}
      onChange={() => {}}
    />,
  );
  const input = screen.getByRole('checkbox', { name: 'Option' });
  expect(input.nextSibling).toBeInstanceOf(HTMLElement);
  const label = screen.getByText('Option').closest('label');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
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
  const input = screen.getByRole('checkbox', { name: 'Option' });
  fireEvent.click(input);
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
  const input = screen.getByRole('checkbox', { name: 'Option' });
  fireEvent.click(input);
  expect(handler).toHaveBeenCalledWith(false);
});
