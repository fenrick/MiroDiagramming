/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { FormGroup } from '../src/ui/components/FormGroup';

test('renders child content', () => {
  render(<FormGroup>Text</FormGroup>);
  expect(screen.getByText('Text')).toBeInTheDocument();
});

test('forwards attributes to the container', () => {
  render(<FormGroup data-testid='wrapper'>T</FormGroup>);
  expect(screen.getByTestId('wrapper')).toBeInTheDocument();
});
