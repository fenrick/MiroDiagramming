import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { DiffDrawer } from '../src/components/DiffDrawer';
import { ShapeClient } from '../src/core/utils/shape-client';

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
    const applySpy = vi
      .spyOn(ShapeClient.prototype, 'applyOperations')
      .mockResolvedValue({ jobId: 'j1' });
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
    expect(applySpy).toHaveBeenCalledTimes(1);
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

  test('tab cycles within drawer', async () => {
    render(
      <DiffDrawer
        boardId='b1'
        diff={{ creates: [], updates: [], deletes: [{ id: '1' }] }}
        onClose={() => {}}
      />,
    );
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const apply = screen.getByRole('button', { name: /Apply/ });
    expect(cancel).toHaveFocus();
    await userEvent.tab();
    expect(apply).toHaveFocus();
    await userEvent.tab();
    expect(cancel).toHaveFocus();
  });

  test('renders chips for each change type', () => {
    render(
      <DiffDrawer
        boardId='b1'
        diff={{
          creates: [{ id: 'c1' }],
          updates: [{ id: 'u1' }],
          deletes: [{ id: 'd1' }],
        }}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Create')).toHaveClass('diff-chip', 'diff-create');
    expect(screen.getByText('Update')).toHaveClass('diff-chip', 'diff-update');
    expect(screen.getByText('Delete')).toHaveClass('diff-chip', 'diff-delete');
  });
});
