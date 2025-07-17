/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ArrangeTab } from '../fenrick.miro.ux/src/ui/pages/ArrangeTab';
import * as grid from '../fenrick.miro.ux/src/board/grid-tools';
import * as spacing from '../fenrick.miro.ux/src/board/spacing-tools';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(
  global as unknown as { ResizeObserver: typeof ResizeObserver }
).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

beforeEach(() => {
  vi.spyOn(grid, 'applyGridLayout').mockResolvedValue(undefined);
  vi.spyOn(spacing, 'applySpacingLayout').mockResolvedValue(undefined);
});

describe('ArrangeTab', () => {
  test('sort by name toggle shows orientation select', () => {
    render(<ArrangeTab />);
    fireEvent.click(screen.getByLabelText('Sort by name'));
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
  });

  test('apply grid button calls grid layout', () => {
    const spy = vi.spyOn(grid, 'applyGridLayout');
    render(<ArrangeTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Arrange Grid' }));
    expect(spy).toHaveBeenCalled();
  });

  test('group result toggle shows frame title input', () => {
    render(<ArrangeTab />);
    fireEvent.click(screen.getByLabelText('Group items into Frame'));
    expect(screen.getByPlaceholderText('Optional')).toBeInTheDocument();
  });

  test('distribute button calls spacing layout', () => {
    const spy = vi.spyOn(spacing, 'applySpacingLayout');
    render(<ArrangeTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Distribute' }));
    expect(spy).toHaveBeenCalled();
  });

  test('shows page help tooltip', async () => {
    render(<ArrangeTab />);
    const helpButton = screen.getByRole('button', { name: 'Help' });
    fireEvent.focus(helpButton);
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Grid and spacing tools');
  });
});
