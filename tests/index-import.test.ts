/** Entry index tests */
jest.mock('../src/DiagramApp', () => {
  return {
    DiagramApp: {
      getInstance: jest.fn(() => ({
        init: jest.fn().mockResolvedValue(undefined),
      })),
    },
  };
});

describe('index entrypoint', () => {
  test('initializes DiagramApp on import', async () => {
    await import('../src/index');
    const { DiagramApp } = await import('../src/DiagramApp');
    expect(DiagramApp.getInstance).toHaveBeenCalled();
    const instance = (DiagramApp.getInstance as jest.Mock).mock.results[0]
      .value;
    expect(instance.init).toHaveBeenCalled();
  });
});
