/** Entry index error handling */
vi.mock('../src/app/diagram-app', () => ({
  DiagramApp: {
    getInstance: vi.fn(() => ({
      init: vi.fn().mockRejectedValue(new Error('fail')),
    })),
  },
}));

import * as log from '../src/logger';

test('logs error when initialization fails', async () => {
  const errorSpy = vi.spyOn(log, 'error').mockImplementation(() => {});
  await import('../src/index');
  expect(errorSpy).toHaveBeenCalled();
});
