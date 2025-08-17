/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { Button } from '../src/ui/components/Button';

describe('Button accessibility', () => {
  test('activates on Enter and Space', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Button onClick={spy}>Do</Button>);
    const btn = screen.getByRole('button', { name: 'Do' });
    btn.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
