'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var notifications_1 = require('../src/notifications');
describe('showError', function () {
  beforeEach(function () {
    global.miro = { board: { notifications: { showError: jest.fn() } } };
    jest.spyOn(console, 'error').mockImplementation(function () {});
  });
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  test('passes through short messages', function () {
    (0, notifications_1.showError)('fail');
    expect(console.error).toHaveBeenCalledWith('fail');
    expect(global.miro.board.notifications.showError).toHaveBeenCalledWith(
      'fail',
    );
  });
  test('truncates long messages', function () {
    var long = 'a'.repeat(90);
    (0, notifications_1.showError)(long);
    expect(console.error).toHaveBeenCalledWith(long);
    var arg = global.miro.board.notifications.showError.mock.calls[0][0];
    expect(arg.length).toBeLessThanOrEqual(80);
    expect(arg.endsWith('...')).toBe(true);
  });
});
