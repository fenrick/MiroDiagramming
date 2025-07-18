/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HelpTab } from '../src/ui/pages/HelpTab';

describe('HelpTab', () => {
  test('lists diagram options', () => {
    render(<HelpTab />);
    expect(
      screen.getByRole('heading', { name: /diagram layout options/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/compact hierarchical tree/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show changelog/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/unreleased/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show changelog/i }));
    expect(screen.getByText(/unreleased/i)).toBeInTheDocument();
  });
});
