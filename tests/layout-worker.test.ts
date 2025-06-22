import { jest } from '@jest/globals';

/** Verify that LayoutEngine uses a Web Worker when available. */
test('layoutGraph uses Web Worker when supported', async () => {
  const originalWorker = (global as { Worker?: typeof Worker }).Worker;
  const originalWindow = (global as { window?: unknown }).window;
  (global as { window: { location: { href: string } } }).window = {
    location: { href: 'http://localhost/' },
  };

  let posted: unknown;
  class MockWorker {
    onmessage: ((e: { data: unknown }) => void) | null = null;
    constructor() {}
    postMessage(data: { id: number; data: unknown; opts: unknown }) {
      posted = data;
      this.onmessage?.({
        data: { id: data.id, result: { nodes: {}, edges: [] } },
      });
    }
  }
  (global as { Worker: typeof Worker }).Worker =
    MockWorker as unknown as typeof Worker;
  jest.resetModules();
  const { LayoutEngine } = await import('../src/core/layout/elk-layout');
  (LayoutEngine as { instance?: unknown }).instance = undefined;
  const engine = LayoutEngine.getInstance();
  const result = await engine.layoutGraph({ nodes: [], edges: [] });
  expect(result).toEqual({ nodes: {}, edges: [] });
  expect(posted).toEqual({ id: 1, data: { nodes: [], edges: [] }, opts: {} });

  (global as { Worker?: typeof Worker }).Worker = originalWorker;
  (global as { window?: unknown }).window = originalWindow;
});
