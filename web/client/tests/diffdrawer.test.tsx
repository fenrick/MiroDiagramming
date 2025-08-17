import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { DiffDrawer } from '../src/components/DiffDrawer';

describe('DiffDrawer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('disables apply when no changes', () => {
    render(
      <DiffDrawer
        boardId='b1'
        diff={{ creates: [], updates: [], deletes: [] }}
        onClose={() => {}}
      />,
    );
    const btn = screen.getByRole('button', { name: /Apply 0 changes/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('title', 'No changes');
  });

  test('applies changes and returns job id', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        json: () => Promise.resolve({ jobId: 'j1' }),
      } as Response);
    const onApplied = vi.fn();
    render(
      <DiffDrawer
        boardId='b1'
        diff={{ creates: [{ shape: 'r' }], updates: [], deletes: [] }}
        onClose={() => {}}
        onApplied={onApplied}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Apply 1 changes/ }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onApplied).toHaveBeenCalledWith('j1');
  });

  test('Escape closes drawer', async () => {
    const onClose = vi.fn();
    render(
      <DiffDrawer
        boardId='b1'
        diff={{ creates: [], updates: [], deletes: [{ id: '1' }] }}
        onClose={onClose}
      />,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
