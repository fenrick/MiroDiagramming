import { beforeEach, expect, test, vi } from 'vitest';
import type { Tag } from '@mirohq/websdk-types';
import { CardProcessor } from '../src/board/card-processor';
import { TagClient } from '../src/core/utils/tag-client';

vi.stubGlobal('fetch', vi.fn());

beforeEach(() => (fetch as unknown as vi.Mock).mockReset());

test('getBoardTags uses tag client', async () => {
  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue([{ id: 't1', title: 'tag' }]),
  });
  const processor = new CardProcessor(
    undefined,
    new TagClient('b1', '/api'),
  ) as unknown as { getBoardTags: () => Promise<Tag[]> };
  const tags: Tag[] = await processor.getBoardTags();
  expect((fetch as vi.Mock).mock.calls[0][0]).toBe('/api/b1/tags');
  expect(tags).toHaveLength(1);
});
