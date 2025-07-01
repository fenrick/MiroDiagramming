/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubTabBar, SubTab } from '../src/ui/components/SubTabBar';

describe('SubTabBar accessibility', () => {
  const tabs: SubTab[] = [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two' },
  ];

  test('arrow key navigation and roles', () => {
    const handler = vi.fn();
    render(
      <SubTabBar
        tabs={tabs}
        tab='one'
        onChange={handler}
      />,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const [first, second] = screen.getAllByRole('tab');
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: 'Enter' });
    expect(handler).toHaveBeenCalledWith('two');
  });
});
