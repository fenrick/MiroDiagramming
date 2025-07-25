/** Entry index tests */
vi.mock('../src/app/diagram-app', () => {
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
    const { DiagramApp } = await import('../src/app/diagram-app');
    expect(DiagramApp.getInstance).toHaveBeenCalled();
    const instance = (DiagramApp.getInstance as jest.Mock).mock.results[0]
      .value;
    expect(instance.init).toHaveBeenCalled();
  });
});
