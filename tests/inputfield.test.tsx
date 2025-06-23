/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputField } from '../src/ui/components/legacy/InputField';

test('renders label and input', () => {
  render(<InputField label='Name' value='x' onChange={() => {}} />);
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
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
  expect(screen.getByTestId('custom')).toBeInTheDocument();
});
