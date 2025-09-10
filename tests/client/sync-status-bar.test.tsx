/** @vitest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';
import { SyncStatusBar } from '../src/components/SyncStatusBar';
import { useSyncStore } from '../src/core/state/sync-store';
import { apiFetch } from '../src/core/utils/api-fetch';

vi.mock('../src/core/utils/api-fetch');

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
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 0, bucket_fill: { user: 100 } }),
    } as Response);
    render(<SyncStatusBar />);
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });

  test('shows syncing with remaining items', async () => {
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 2, bucket_fill: { user: 100 } }),
    } as Response);
    render(<SyncStatusBar />);
    expect(await screen.findByText('Syncing 2 changes…')).toBeInTheDocument();
    expect(screen.getByTestId('sync-progress')).toBeInTheDocument();
  });

  test('shows near limit warning', async () => {
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        queue_length: 0,
        bucket_fill: { primary: 100, secondary: 1 },
      }),
    } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Slowing to avoid limits'),
    ).toBeInTheDocument();
  });

  test('shows rate limited when bucket empty', async () => {
    vi.useFakeTimers();
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 0, bucket_fill: { user: 0 } }),
    } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Paused for 12s (auto-resume)'),
    ).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      await screen.findByText('Paused for 11s (auto-resume)'),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  test('shows disconnected on fetch error', async () => {
    (apiFetch as unknown as vi.Mock).mockRejectedValue(new Error('network'));
    render(<SyncStatusBar />);
    expect(await screen.findByText('Disconnected')).toBeInTheDocument();
  });

  test('returns to idle when queue clears', async () => {
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 0, bucket_fill: { user: 100 } }),
    } as Response);
    render(<SyncStatusBar />);
    await act(async () => {
      useSyncStore.getState().setQueue(1);
    });
    expect(await screen.findByText('Syncing 1 changes…')).toBeInTheDocument();
    await act(async () => {
      useSyncStore.getState().setQueue(0);
    });
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });
});
