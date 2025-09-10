import { afterEach, expect, test, vi } from 'vitest';
import * as logger from '../src/logger';
import { diffShown, oauthPromptShown } from '../src/core/telemetry';

vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env.NODE_ENV = 'test';
});

test('diffShown posts event payload', async () => {
  const fetchSpy = vi
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(null, { status: 202 }));
  process.env.NODE_ENV = 'development';
  await diffShown({ creates: 1, updates: 2, deletes: 3, boardId: 'b1' });
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  const [, init] = fetchSpy.mock.calls[0];
  const body = JSON.parse(String(init?.body));
  expect(body[0].message).toBe('diff_shown');
  expect(body[0].context).toEqual({
    creates: 1,
    updates: 2,
    deletes: 3,
    boardId: 'b1',
  });
});

test('telemetry logs network failures', async () => {
  const fetchSpy = vi
    .spyOn(global, 'fetch')
    .mockRejectedValue(new Error('offline'));
  const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  process.env.NODE_ENV = 'development';
  await oauthPromptShown();
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(errorSpy).toHaveBeenCalled();
});
