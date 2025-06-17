import {
  findNode,
  findConnector,
  createNode,
  createEdges,
  syncAll,
  resetBoardCache,
  defaultBuilder,
} from '../src/graph';

/**
 * Tests for the wrapper functions exported from graph.ts
 * which delegate to the default BoardBuilder instance.
 */

describe('graph wrapper functions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('findNode delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'findNode')
      .mockResolvedValue('x' as any);
    // Call wrapper and verify delegation
    const res = await findNode('t', 'l');
    expect(spy).toHaveBeenCalledWith('t', 'l');
    expect(res).toBe('x');
  });

  test('findConnector delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'findConnector')
      .mockResolvedValue('c' as any);
    // Wrapper should forward parameters to builder
    const res = await findConnector('a', 'b');
    expect(spy).toHaveBeenCalledWith('a', 'b');
    expect(res).toBe('c');
  });

  test('createNode delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'createNode')
      .mockResolvedValue('n' as any);
    // Pass-through call should return builder result
    const res = await createNode({} as any, {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
    expect(spy).toHaveBeenCalled();
    expect(res).toBe('n');
  });

  test('createEdges delegates to default builder', async () => {
    const spy = jest
      .spyOn(defaultBuilder, 'createEdges')
      .mockResolvedValue(['e'] as any);
    const res = await createEdges([] as any, {} as any);
    // Should simply return value from builder
    expect(spy).toHaveBeenCalled();
    expect(res[0]).toBe('e');
  });

  test('syncAll delegates to default builder', async () => {
    const spy = jest.spyOn(defaultBuilder, 'syncAll').mockResolvedValue();
    await syncAll([] as any);
    expect(spy).toHaveBeenCalled();
  });

  test('resetBoardCache calls builder.reset', () => {
    const spy = jest.spyOn(defaultBuilder, 'reset');
    resetBoardCache();
    expect(spy).toHaveBeenCalled();
  });
});
