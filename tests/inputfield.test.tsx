/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputField } from '../src/ui/components/InputField';

test('renders label and input', () => {
  render(
    <InputField
      label='Name'
      value='x'
      onChange={() => {}}
    />,
  );
  const input = screen.getByLabelText('Name');
  expect(input).toBeInTheDocument();
  const label = screen.getByText('Name');
  expect(label).toHaveAttribute('for', input.getAttribute('id'));
});

test('calls onChange with value', () => {
  const handler = jest.fn();
  render(
    <InputField
      label='Age'
      onChange={handler}
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

test('applies layout styles', () => {
  render(<InputField label='Email' />);
  const input = screen.getByLabelText('Email');
  const label = screen.getByText('Email');
  const field = input.parentElement?.parentElement as HTMLElement;
  expect(field).toHaveStyle('margin-bottom: 16px');
  expect(field).toHaveStyle('position: relative');
  expect(label).toHaveStyle('margin-bottom: var(--space-xsmall)');
  expect(input).toHaveStyle('padding-left: var(--space-small)');
  expect(input).toHaveStyle('padding-right: var(--space-small)');
});
