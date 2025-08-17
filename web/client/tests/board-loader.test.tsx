import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test, vi } from 'vitest';
import { BoardLoader } from '../src/components/BoardLoader';

vi.mock('logfire', () => ({ span: (_n: string, fn: () => unknown) => fn() }));

vi.stubGlobal('fetch', vi.fn());
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
});

beforeEach(() => {
  (fetch as vi.Mock).mockReset();
});

test('shows empty state when cache is empty', async () => {
  vi.useFakeTimers();
  (fetch as vi.Mock).mockImplementation(async () => ({
    json: async () => ({ version: 1, shapes: [] }),
  }));
  render(<BoardLoader boardId='b1' />);
  await act(async () => {
    await vi.runAllTimersAsync();
    await Promise.resolve();
  });
  await screen.findByText(/No items yet/);
  expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
});

test('refresh board reloads snapshot', async () => {
  vi.useFakeTimers();
  (fetch as vi.Mock)
    .mockImplementationOnce(async () => ({
      json: async () => ({ version: 1, shapes: [{ id: 's1', text: 'A' }] }),
    }))
    .mockImplementationOnce(async () => ({
      json: async () => ({ version: 2, shapes: [{ id: 's2', text: 'B' }] }),
    }));
  render(<BoardLoader boardId='b2' />);
  await act(async () => {
    await vi.runAllTimersAsync();
    await Promise.resolve();
  });
  await screen.findByText('A');
  const btn = screen.getByRole('button', { name: /refresh board/i });
  fireEvent.click(btn);
  await act(async () => {
    await vi.runAllTimersAsync();
    await Promise.resolve();
  });
  await screen.findByText('B');
  expect((fetch as vi.Mock).mock.calls[1][0]).toContain('refresh=true');
});
