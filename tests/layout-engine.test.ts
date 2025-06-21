import { LayoutEngine, layoutEngine } from '../src/core/elk-layout';
import ELK from 'elkjs/lib/elk.bundled.js';

/** Verify singleton behaviour and minimal layout handling. */
describe('LayoutEngine', () => {
  test('getInstance returns the exported singleton', () => {
    expect(LayoutEngine.getInstance()).toBe(layoutEngine);
    (LayoutEngine as unknown as { instance?: LayoutEngine }).instance =
      undefined;
    expect(LayoutEngine.getInstance()).not.toBeUndefined();
  });

  test('layoutGraph handles graphs without edges', async () => {
    const graph = { nodes: [{ id: 'n', label: 'A', type: 'Role' }], edges: [] };
    const result = await layoutEngine.layoutGraph(
      graph as Parameters<typeof layoutEngine.layoutGraph>[0],
    );
    expect(Object.keys(result.nodes)).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });

  test('layoutGraph forwards options', async () => {
    const spy = jest
      .spyOn(ELK.prototype, 'layout')
      .mockResolvedValue({ children: [], edges: [] } as unknown);
    const graph = { nodes: [], edges: [] };
    await layoutEngine.layoutGraph(
      graph as Parameters<typeof layoutEngine.layoutGraph>[0],
      {
        algorithm: 'force',
        direction: 'LEFT',
        spacing: 50,
      },
    );
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        layoutOptions: expect.objectContaining({
          'elk.algorithm': 'force',
          'elk.direction': 'LEFT',
          'elk.spacing.nodeNode': 50,
        }),
      }),
    );
    spy.mockRestore();
  });
});
