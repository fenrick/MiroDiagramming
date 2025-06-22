import { performLayout, LayoutResult } from './layout-core';
import { GraphData } from '../graph';
import { UserLayoutOptions } from './elk-options';

let worker: Worker | undefined;
let msgId = 0;
const pending = new Map<number, (res: LayoutResult) => void>();

/**
 * LayoutEngine executes ELK layout in a Web Worker when available.
 */
export class LayoutEngine {
  private static instance: LayoutEngine;
  private constructor() {
    if (typeof Worker !== 'undefined') {
      const url = new URL('./elk-worker.js', window.location.href);
      worker = new Worker(url, { type: 'module' });
      worker.onmessage = e => {
        const cb = pending.get(e.data.id);
        if (cb) {
          pending.delete(e.data.id);
          cb(e.data.result as LayoutResult);
        }
      };
    }
  }

  /** Access the shared layout engine instance. */
  public static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) LayoutEngine.instance = new LayoutEngine();
    return LayoutEngine.instance;
  }

  /**
   * Run ELK layout either in the worker or directly.
   */
  public async layoutGraph(
    data: GraphData,
    opts: Partial<UserLayoutOptions> = {},
  ): Promise<LayoutResult> {
    if (worker) {
      return new Promise(resolve => {
        const id = ++msgId;
        pending.set(id, resolve);
        worker!.postMessage({ id, data, opts });
      });
    }
    return performLayout(data, opts);
  }
}

export const layoutEngine = LayoutEngine.getInstance();
export type { LayoutResult } from './layout-core';
