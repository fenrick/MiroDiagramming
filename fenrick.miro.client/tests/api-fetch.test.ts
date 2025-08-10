import { expect, test, vi } from 'vitest';
import { apiFetch } from '../src/core/utils/api-fetch';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as Response));
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 42 }) },
});

test('apiFetch attaches user header', async () => {
  await apiFetch('/api/test');
  const call = (fetch as unknown as vi.Mock).mock.calls[0];
  const headers = call[1].headers as Headers;
  expect(headers.get('X-User-Id')).toBe('42');
});
