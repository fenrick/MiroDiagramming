import { defaultBuilder, graphService } from '../src/core/graph';

/**
 * Verify that service methods delegate to the default BoardBuilder instance.
 */

describe('graph service methods', () => {
  afterEach(() => jest.restoreAllMocks());

  test('findNode delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'findNode')
      .mockResolvedValue('x' as unknown);
    const result = await graphService.findNode('t', 'l');
    expect(spy).toHaveBeenCalledWith('t', 'l');
    expect(result).toBe('x');
  });

  test('createNode delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'createNode')
      .mockResolvedValue('n' as unknown);
    const result = await graphService.createNode(
      {} as Record<string, unknown>,
      { x: 0, y: 0, width: 1, height: 1 },
    );
    expect(spy).toHaveBeenCalled();
    expect(result).toBe('n');
  });

  test('createEdges delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'createEdges')
      .mockResolvedValue(['e'] as unknown as string[]);
    const result = await graphService.createEdges(
      [] as unknown as Array<unknown>,
      {} as Record<string, unknown>,
    );
    // Should simply return value from builder
    expect(spy).toHaveBeenCalled();
    expect(result[0]).toBe('e');
  });

  test('syncAll delegates to default builder', async () => {
    const spy = jest.spyOn(defaultBuilder, 'syncAll').mockResolvedValue();
    await graphService.syncAll([] as unknown as Array<unknown>);
    expect(spy).toHaveBeenCalled();
  });

  test('resetBoardCache calls builder.reset', () => {
    const spy = jest.spyOn(defaultBuilder, 'reset');
    graphService.resetBoardCache();
    expect(spy).toHaveBeenCalled();
  });
});
