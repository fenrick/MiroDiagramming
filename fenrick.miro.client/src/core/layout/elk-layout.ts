import { GraphData } from '../graph';
import { UserLayoutOptions } from './elk-options';
import { LayoutResult, performLayout } from './layout-core';

/**
 * LayoutEngine executes ELK layout directly within the main thread.
 */
export class LayoutEngine {
  private static instance: LayoutEngine;

  private constructor() {
  }

  /** Access the shared layout engine instance. */
  public static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) {
      LayoutEngine.instance = new LayoutEngine();
    }
    return LayoutEngine.instance;
  }

  /**
   * Run ELK layout on the provided graph data.
   */
  public async layoutGraph(
    data: GraphData,
    opts: Partial<UserLayoutOptions> = {},
  ): Promise<LayoutResult> {
    return performLayout(data, opts);
  }
}

export const layoutEngine = LayoutEngine.getInstance();
export type {
  LayoutResult
}
  from;
'./layout-core';
