/** @vitest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import { SyncStatusBar } from '../src/components/SyncStatusBar';
import { useSyncStore } from '../src/core/state/sync-store';

describe('SyncStatusBar', () => {
  beforeEach(() => {
    useSyncStore.setState({
      queue: 0,
      activeJobs: 0,
      remainingCredits: null,
      state: 'ok',
      backoffSeconds: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('shows idle when queue empty', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 100 }),
      } as Response);
    render(<SyncStatusBar />);
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });

  test('shows syncing with remaining items', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 100 }),
      } as Response);
    useSyncStore.getState().setQueue(2);
    render(<SyncStatusBar />);
    expect(await screen.findByText('2 items remaining')).toBeInTheDocument();
  });

  test('shows near limit warning', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 1 }),
      } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Slowing to avoid limits'),
    ).toBeInTheDocument();
  });

  test('shows rate limited message', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 0, retryAfter: 12 }),
      } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Pausing for 12s (auto-resume)'),
    ).toBeInTheDocument();
  });

  test('shows disconnected on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    render(<SyncStatusBar />);
    expect(await screen.findByText('Disconnected')).toBeInTheDocument();
  });

  test('returns to idle when queue clears', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 100 }),
      } as Response);
    render(<SyncStatusBar />);
    await act(async () => {
      useSyncStore.getState().setQueue(1);
    });
    expect(await screen.findByText('1 items remaining')).toBeInTheDocument();
    await act(async () => {
      useSyncStore.getState().setQueue(0);
    });
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });
});
