/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ArrangeTab } from '../src/ui/pages/ArrangeTab';
import * as grid from '../src/board/grid-tools';
import * as spacing from '../src/board/spacing-tools';

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
});
