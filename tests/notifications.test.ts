import { showError } from '../src/notifications';

declare const global: any;

describe('showError', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        notifications: { showError: jest.fn().mockResolvedValue(undefined) },
      },
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('passes through short messages', async () => {
    await showError('fail');
    expect(console.error).toHaveBeenCalledWith('fail');
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'fail',
    );
  });

  test('truncates long messages', async () => {
    const long = 'a'.repeat(90);
    await showError(long);
    expect(console.error).toHaveBeenCalledWith(long);
    const arg = (global.miro.board.notifications.showError as jest.Mock).mock
      .calls[0][0];
    expect(arg.length).toBeLessThanOrEqual(80);
    expect(arg.endsWith('...')).toBe(true);
  });
});
