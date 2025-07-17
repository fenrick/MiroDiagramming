import { vi } from 'vitest';
import { LayoutEngine } from '../fenrick.miro.ux/src/core/layout/elk-layout';
import * as layoutCore from '../fenrick.miro.ux/src/core/layout/layout-core';

/** Ensure layout runs inline even when Web Worker exists. */
test('layoutGraph runs without Web Worker', async () => {
  const origWorker = (global as { Worker?: typeof Worker }).Worker;
  (global as { Worker: typeof Worker }).Worker = class {} as typeof Worker;
  const spy = vi
    .spyOn(layoutCore, 'performLayout')
    .mockResolvedValue({ nodes: {}, edges: [] });
  const engine = LayoutEngine.getInstance();
  const result = await engine.layoutGraph({ nodes: [], edges: [] });
  expect(result).toEqual({ nodes: {}, edges: [] });
  expect(spy).toHaveBeenCalled();
  (global as { Worker?: typeof Worker }).Worker = origWorker;
  spy.mockRestore();
});
