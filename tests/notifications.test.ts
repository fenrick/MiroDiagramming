import { showError } from '../src/notifications';

declare const global: any;

describe('showError', () => {
  beforeEach(() => {
    global.miro = { board: { notifications: { showError: jest.fn() } } };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('passes through short messages', () => {
    showError('fail');
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'fail',
    );
  });

  test('truncates long messages', () => {
    const long = 'a'.repeat(90);
    showError(long);
    const arg = (global.miro.board.notifications.showError as jest.Mock).mock
      .calls[0][0];
    expect(arg.length).toBeLessThanOrEqual(80);
    expect(arg.endsWith('...')).toBe(true);
  });
});
