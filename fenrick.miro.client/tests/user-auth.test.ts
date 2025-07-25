import { expect, vi } from 'vitest';

import { AuthClient, registerCurrentUser } from '../src/user-auth';

test('registerCurrentUser posts auth details', async () => {
  const client = new AuthClient('/api/users');
  const fetchMock = vi.fn().mockResolvedValue({});
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
