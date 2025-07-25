import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { DummyTab } from '../src/ui/pages/DummyTab';

/**
 * Renders DummyTab and asserts accessible role and text label.
 */
describe('DummyTab', () =>
  test('renders tab panel with label', () => {
    render(<DummyTab />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'panel-dummy');
    expect(screen.getByTestId('dummy')).toHaveTextContent('Dummy');
    expect(tabDef[1]).toBe('dummy');
    expect(tabDef[2]).toBe('Dummy');
  }));
