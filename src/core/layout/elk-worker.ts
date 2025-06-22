import { performLayout } from './layout-core';

/**
 * Web Worker wrapper around {@link performLayout}. It receives layout
 * requests via `postMessage` and returns the computed graph positions.
 */

self.onmessage = async (e: MessageEvent) => {
  const { id, data, opts } = e.data as {
    id: number;
    data: Parameters<typeof performLayout>[0];
    opts: Parameters<typeof performLayout>[1];
  };
  const result = await performLayout(data, opts);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).postMessage({ id, result });
};
export {};
