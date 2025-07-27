import { expect, test, vi } from 'vitest';

import { AuthClient, registerCurrentUser } from '../src/user-auth';

test('registerCurrentUser posts auth details', async () => {
  const client = new AuthClient('/api/users');
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  const boardMock = {
    getIdToken: vi.fn().mockResolvedValue('tok'),
    getUserInfo: vi.fn().mockResolvedValue({ id: 'u1', name: 'Bob' }),
  };
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
  (global as unknown as { miro: unknown }).miro = { board: boardMock };

  await registerCurrentUser(client);

  expect(fetchMock).toHaveBeenCalledWith(
    '/api/users',
    expect.objectContaining({ method: 'POST' }),
  );
});

test('registerCurrentUser retries on failure', async () => {
  vi.useFakeTimers();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, status: 200 });
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
  (global as unknown as { miro: unknown }).miro = {
    board: {
      getIdToken: vi.fn().mockResolvedValue('tok'),
      getUserInfo: vi.fn().mockResolvedValue({ id: 'u2', name: 'Ann' }),
    },
  };
  const client = new AuthClient('/api/users');
  const promise = registerCurrentUser(client);
  await vi.runAllTimersAsync();
  await promise;
  expect(fetchMock).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});
