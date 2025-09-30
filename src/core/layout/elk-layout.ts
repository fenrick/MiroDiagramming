import { type GraphData } from '../graph'

import { type UserLayoutOptions } from './elk-options'
import { type LayoutResult, performLayout } from './layout-core'

/**
 * LayoutEngine executes ELK layout directly within the main thread.
 */
type LayoutPerformer = typeof performLayout

export class LayoutEngine {
  private static instance: LayoutEngine | null = null

  private readonly runLayout: LayoutPerformer

  private constructor(runLayout: LayoutPerformer = performLayout) {
    this.runLayout = runLayout
  }

  /** Access the shared layout engine instance. */
  public static getInstance(): LayoutEngine {
    LayoutEngine.instance ??= new LayoutEngine()
    return LayoutEngine.instance
  }

  /**
   * Run ELK layout on the provided graph data.
   */
  public async layoutGraph(
    data: GraphData,
    options: Partial<UserLayoutOptions> = {},
  ): Promise<LayoutResult> {
    return this.runLayout(data, options)
  }
}

export const layoutEngine = LayoutEngine.getInstance()
export type { LayoutResult } from './layout-core'
