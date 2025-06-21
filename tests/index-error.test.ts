/** Entry index error handling */
jest.mock('../src/app/DiagramApp', () => {
  return {
    DiagramApp: {
      getInstance: jest.fn(() => ({
        init: jest.fn().mockRejectedValue(new Error('fail')),
      })),
    },
  };
});

test('logs error when initialization fails', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await import('../src/index');
  expect(errorSpy).toHaveBeenCalled();
});
