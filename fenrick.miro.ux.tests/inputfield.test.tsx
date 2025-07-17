/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputField } from 'fenrick.miro.ux/ui/components/InputField';

test('renders label and input', () => {
  render(
    <InputField
      label='Name'
      value='x'
      onValueChange={() => {}}
    />,
  );
  const input = screen.getByLabelText('Name');
  expect(input).toBeInTheDocument();
  const label = screen.getByText('Name');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
});

test('calls onValueChange with value', () => {
  const handler = jest.fn();
  render(
    <InputField
      label='Age'
      onValueChange={handler}
    />,
  );
  const input = screen.getByLabelText('Age');
  fireEvent.change(input, { target: { value: '42' } });
  expect(handler).toHaveBeenCalledWith('42');
});

test('forwards input attributes', () => {
  render(
    <InputField
      label='File'
      type='file'
      data-testid='file-input'
    />,
  );
  const input = screen.getByTestId('file-input');
  const label = screen.getByText('File');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
  expect(input).toHaveAttribute('type', 'file');
});
