/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramsTab } from '../src/ui/pages/DiagramsTab';

describe('DiagramsTab switching', () => {
  test('changes sub tabs', () => {
    render(<DiagramsTab />);
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    expect(
      screen.getByText('Board-linked items with thumbnail and title'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Layout Engine' }));
    expect(screen.getByText('Layout engine coming soon.')).toBeInTheDocument();
  });
});
