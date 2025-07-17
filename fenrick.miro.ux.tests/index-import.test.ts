/** Entry index tests */
vi.mock('../fenrick.miro.ux/src/app/diagram-app', () => {
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
    await import('../fenrick.miro.ux/src/index');
    const { DiagramApp } = await import(
      '../fenrick.miro.ux/src/app/diagram-app'
    );
    expect(DiagramApp.getInstance).toHaveBeenCalled();
    const instance = (DiagramApp.getInstance as jest.Mock).mock.results[0]
      .value;
    expect(instance.init).toHaveBeenCalled();
  });
});
