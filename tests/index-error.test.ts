/** Entry index error handling */
vi.mock('../src/app/diagram-app', () => {
  return {
    DiagramApp: {
      getInstance: vi.fn(() => ({
        init: vi.fn().mockRejectedValue(new Error('fail')),
      })),
    },
  };
});

test('logs error when initialization fails', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await import('../src/index');
  expect(errorSpy).toHaveBeenCalled();
});
