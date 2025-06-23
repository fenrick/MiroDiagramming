/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputField } from '../src/ui/components/legacy/InputField';

test('renders label and input', () => {
  render(<InputField label='Name' value='x' onChange={() => {}} />);
  const input = screen.getByLabelText('Name');
  expect(input).toBeInTheDocument();
  const label = screen.getByText('Name');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
});

test('calls onChange with value', () => {
  const handler = jest.fn();
  render(<InputField label='Age' onChange={handler} />);
  const input = screen.getByLabelText('Age');
  fireEvent.change(input, { target: { value: '42' } });
  expect(handler).toHaveBeenCalledWith('42');
});

test('supports custom child element', () => {
  render(
    <InputField label='File'>
      <input data-testid='custom' type='file' />
    </InputField>,
  );
  const input = screen.getByTestId('custom');
  const label = screen.getByText('File');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
  expect(input).toBeInTheDocument();
});
