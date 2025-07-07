/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramsTab } from '../src/ui/pages/DiagramsTab';

describe('DiagramsTab switching', () => {
  test('changes sub tabs', () => {
    render(<DiagramsTab />);
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    const buttons = screen.getAllByRole('button', { name: 'Help' });
    const helpButton = buttons[buttons.length - 1];
    expect(helpButton).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Layout Engine' }));
    const layoutTab = await screen.findByRole('tab', { name: 'Layout Engine' });
    expect(layoutTab).toHaveAttribute('aria-selected', 'true');
  });
});
