import { renderHook, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { useAuthStatus } from '../src/core/hooks/useAuthStatus';
import { apiFetch } from '../src/core/utils/api-fetch';

vi.mock('../src/core/utils/api-fetch');

test('resumes pending job after reauth', async () => {
  (apiFetch as unknown as vi.Mock).mockResolvedValue({ ok: true });
  const job = vi
    .fn()
    .mockResolvedValueOnce({ status: 401 })
    .mockResolvedValueOnce('done');

  const { result } = renderHook(() => useAuthStatus());
  await act(async () => {
    await result.current.runWithAuth(job);
  });
  expect(result.current.status).toBe('expired');
  expect(job).toHaveBeenCalledTimes(1);

  await act(async () => {
    await result.current.check();
  });
  expect(job).toHaveBeenCalledTimes(2);
  expect(result.current.status).toBe('ok');
});
