/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DiagramsTab } from 'fenrick.miro.ux/ui/pages/DiagramsTab';

describe('DiagramsTab switching', () => {
  test('changes sub tabs', async () => {
    render(<DiagramsTab />);
    fireEvent.click(screen.getByRole('tab', { name: 'Cards' }));
    const buttons = screen.getAllByRole('button', { name: 'Help' });
    const helpButton = buttons[buttons.length - 1];
    expect(helpButton).toBeInTheDocument();
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('tab', { name: 'Layout Engine' }));
    });
    await screen.findByText('Layout engine coming soon.');
  });
});
