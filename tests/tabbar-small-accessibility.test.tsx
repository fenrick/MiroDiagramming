/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabBar, TabItem } from '../src/ui/components/TabBar';

describe('TabBar small variant accessibility', () => {
  const tabs: TabItem[] = [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two' },
  ];

  test('arrow key navigation and roles', () => {
    const handler = vi.fn();
    render(
      <TabBar
        tabs={tabs}
        tab='one'
        onChange={handler}
        size='small'
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
