/** Entry index error handling */
vi.mock('../fenrick.miro.ux/src/app/diagram-app', () => {
  return {
    DiagramApp: {
      getInstance: vi.fn(() => ({
        init: vi.fn().mockRejectedValue(new Error('fail')),
      })),
    },
  };
});

import { log } from '../fenrick.miro.ux/src/logger';

test('logs error when initialization fails', async () => {
  const errorSpy = jest.spyOn(log, 'error').mockImplementation(() => {});
  await import('../fenrick.miro.ux/src/index');
  expect(errorSpy).toHaveBeenCalled();
});
