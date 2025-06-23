/** Entry index tests */
vi.mock('../src/app/DiagramApp', () => {
  return {
    DiagramApp: {
      getInstance: vi.fn(() => ({
        init: vi.fn().mockResolvedValue(undefined),
      })),
    },
  };
});

describe('index entrypoint', () => {
  test('initializes DiagramApp on import', async () => {
    await import('../src/index');
    const { DiagramApp } = await import('../src/app/DiagramApp');
    expect(DiagramApp.getInstance).toHaveBeenCalled();
    const instance = (DiagramApp.getInstance as jest.Mock).mock.results[0]
      .value;
    expect(instance.init).toHaveBeenCalled();
  });
});
