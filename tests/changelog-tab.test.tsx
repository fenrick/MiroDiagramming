/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChangelogTab } from '../src/ui/pages/ChangelogTab';

describe('ChangelogTab', () => {
  test('renders changelog heading', () => {
    render(<ChangelogTab />);
    expect(
      screen.getByRole('heading', { name: /changelog/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/initial creation of changelog/i),
    ).toBeInTheDocument();
  });
});
