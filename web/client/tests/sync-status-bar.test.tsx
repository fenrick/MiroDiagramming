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
      json: async () => ({ queue_length: 0, bucket_fill: { user: 100 } }),
    } as Response);
    useSyncStore.getState().setQueue(2);
    render(<SyncStatusBar />);
    expect(await screen.findByText('2 items remaining')).toBeInTheDocument();
  });

  test('shows near limit warning', async () => {
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 0, bucket_fill: { user: 1 } }),
    } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Slowing to avoid limits'),
    ).toBeInTheDocument();
  });

  test('shows rate limited when bucket empty', async () => {
    (apiFetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ queue_length: 0, bucket_fill: { user: 0 } }),
    } as Response);
    render(<SyncStatusBar />);
    expect(
      await screen.findByText('Pausing for 0s (auto-resume)'),
    ).toBeInTheDocument();
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
    expect(await screen.findByText('1 items remaining')).toBeInTheDocument();
    await act(async () => {
      useSyncStore.getState().setQueue(0);
    });
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });
});
