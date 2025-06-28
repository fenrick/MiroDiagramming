/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabBar } from '../src/ui/components/TabBar';
import type { TabTuple } from '../src/ui/pages/tabs';

describe('TabBar accessibility', () => {
  const tabs: TabTuple[] = [
    [1, 'first', 'First', '', () => <div />],
    [2, 'second', 'Second', '', () => <div />],
  ];

  test('tab elements are focusable and respond to keyboard', () => {
    const handler = vi.fn();
    render(
      <TabBar
        tabs={tabs}
        tab='first'
        onChange={handler}
      />,
    );
    const second = screen.getByRole('tab', { name: 'Second' });
    second.focus();
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: 'Enter' });
    expect(handler).toHaveBeenCalledWith('second');
  });
});
