/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageHelp } from '../src/ui/components/PageHelp';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

(
  global as unknown as { ResizeObserver: typeof ResizeObserver }
).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

describe('PageHelp', () => {
  test('shows tooltip on focus', async () => {
    render(<PageHelp content='Example help' />);
    const button = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(button);
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Example help');
  });
});
