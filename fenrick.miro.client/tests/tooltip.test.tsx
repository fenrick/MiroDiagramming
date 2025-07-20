/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Button } from '../src/ui/components/Button';
import { Tooltip } from '../src/ui/components/Tooltip';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

(
  global as unknown as { ResizeObserver: typeof ResizeObserver }
).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

describe('Tooltip', () =>
  test('renders when focusing trigger', async () => {
    render(
      <Tooltip
        content='Focus text'
        side='left'
        align='start'>
        <Button variant='secondary'>?</Button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');
    fireEvent.focus(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Focus text');
  }));
