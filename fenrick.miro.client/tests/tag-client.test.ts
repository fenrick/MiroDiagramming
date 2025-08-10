import { beforeEach, expect, test, vi } from 'vitest';
import { TagClient } from '../src/core/utils/tag-client';

vi.stubGlobal('fetch', vi.fn());
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
});

beforeEach(() => (fetch as unknown as vi.Mock).mockReset());

test('getTags fetches board tags', async () => {
  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue([{ id: 't1', title: 'Tag' }]),
  });
  const api = new TagClient('b1', '/api');
  const tags = await api.getTags();
  expect((fetch as vi.Mock).mock.calls[0][0]).toBe('/api/b1/tags');
  expect(tags).toEqual([{ id: 't1', title: 'Tag' }]);
});
