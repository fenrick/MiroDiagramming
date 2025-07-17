/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormGroup } from '../fenrick.miro.ux/src/ui/components/FormGroup';

test('renders child content', () => {
  render(<FormGroup>Text</FormGroup>);
  expect(screen.getByText('Text')).toBeInTheDocument();
});

test('forwards attributes to the container', () => {
  render(<FormGroup data-testid='wrapper'>T</FormGroup>);
  expect(screen.getByTestId('wrapper')).toBeInTheDocument();
});
