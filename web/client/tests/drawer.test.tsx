/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { Drawer } from '../src/ui/components/Drawer';

describe('Drawer', () => {
  test('traps focus and closes with Escape', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(
      <Drawer
        title='Jobs'
        isOpen
        onClose={spy}>
        <button>First</button>
        <button>Second</button>
      </Drawer>,
    );
    const closeBtn = screen.getByLabelText('Close');
    expect(closeBtn).toHaveFocus();
    await user.tab();
    const first = screen.getByRole('button', { name: 'First' });
    expect(first).toHaveFocus();
    await user.tab();
    const second = screen.getByRole('button', { name: 'Second' });
    expect(second).toHaveFocus();
    await user.tab();
    expect(closeBtn).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(spy).toHaveBeenCalled();
  });
});
