/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolsTab } from '../src/ui/pages/ToolsTab';

describe('ToolsTab', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: {
        getSelection: jest.fn().mockResolvedValue([]),
        ui: { on: jest.fn() },
      },
    };
  });
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
  });

  test('switches between subtabs', async () => {
    render(<ToolsTab />);
    expect(screen.getByText(/apply size/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /colours/i }));
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /arrange/i }));
    expect(screen.getByText(/arrange grid/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /frames/i }));
    expect(
      screen.getByRole('button', { name: /rename frames/i }),
    ).toBeInTheDocument();
  });
});
