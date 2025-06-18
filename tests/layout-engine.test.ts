import { LayoutEngine, layoutEngine } from '../src/elk-layout';

/** Verify singleton behaviour and minimal layout handling. */
describe('LayoutEngine', () => {
  test('getInstance returns the exported singleton', () => {
    expect(LayoutEngine.getInstance()).toBe(layoutEngine);
    (LayoutEngine as any).instance = undefined;
    expect(LayoutEngine.getInstance()).not.toBeUndefined();
  });

  test('layoutGraph handles graphs without edges', async () => {
    const graph = { nodes: [{ id: 'n', label: 'A', type: 'Role' }], edges: [] };
    const result = await layoutEngine.layoutGraph(graph as any);
    expect(Object.keys(result.nodes)).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });
});
