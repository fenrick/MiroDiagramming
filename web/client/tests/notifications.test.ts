import * as log from '../src/logger';
import { showError } from '../src/ui/hooks/notifications';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('showError', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        notifications: { showError: jest.fn().mockResolvedValue(undefined) },
      },
    };
    jest.spyOn(log, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    const arg = (global.miro.board.notifications.showError as jest.Mock).mock
      .calls[0][0];
    expect(arg.length).toBeLessThanOrEqual(80);
    expect(arg.endsWith('...')).toBe(true);
  });
});
