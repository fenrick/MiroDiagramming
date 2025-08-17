import * as log from '../src/logger';
import { showApiError, showError } from '../src/ui/hooks/notifications';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('showError', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        notifications: { showError: vi.fn().mockResolvedValue(undefined) },
      },
    };
    vi.spyOn(log, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.miro;
  });

  test('passes through short messages', async () => {
    await showError('fail');
    expect(log.error).toHaveBeenCalledWith('fail');
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'fail',
    );
  });

  test('truncates long messages', async () => {
    const long = 'a'.repeat(90);
    await showError(long);
    expect(log.error).toHaveBeenCalledWith(long);
    const arg = (global.miro.board.notifications.showError as vi.Mock).mock
      .calls[0][0];
    expect(arg.length).toBeLessThanOrEqual(80);
    expect(arg.endsWith('...')).toBe(true);
  });

  test('maps status codes to messages', async () => {
    await showApiError(429);
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'We\u2019re hitting the API limit. I\u2019ll retry shortly.',
    );
    await showApiError(401);
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'Miro session expired. Please sign in again.',
    );
    await showApiError(503);
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'Miro is having trouble. We\u2019ll retry in a moment.',
    );
  });
});
