import type { BaseItem, Connector, Frame, Group, GroupableItem } from '@mirohq/websdk-types'

import * as log from '../../logger'
import { BoardBuilder } from '../../board/board-builder'
import { clearActiveFrame, registerFrame } from '../../board/frame-utilities'
import { boundingBoxFromCenter, frameOffset } from '../layout/layout-utilities'
import { type HierNode, layoutHierarchy, type NestedLayoutResult } from '../layout/nested-layout'
import { fileUtilities } from '../utils/file-utilities'

import { edgesToHierarchy } from './convert'
import type { GraphData } from './graph-service'
import { UndoableProcessor } from './undoable-processor'

export interface HierarchyProcessOptions {
  createFrame?: boolean
  frameTitle?: string
  sortKey?: string
  /** Spacing between sibling nodes. */
  padding?: number
  /** Height of the invisible spacer inserted above children. */
  topSpacing?: number
}

/**
 * Processor responsible for creating nested diagrams where child widgets are
 * contained inside their parent shapes. Widgets are created using
 * {@link BoardBuilder} and arranged via {@link layoutHierarchy}.
 */
export class HierarchyProcessor extends UndoableProcessor<BaseItem | Group | Frame> {
  constructor(builder: BoardBuilder = new BoardBuilder()) {
    super(builder)
  }

  /**
   * Load a hierarchical JSON file and create the corresponding diagram.
   * @param file File containing the hierarchy array.
   * @param opts Optional behaviour flags such as frame creation.
   */
  public async processFile(file: File, options: HierarchyProcessOptions = {}): Promise<void> {
    fileUtilities.validateFile(file)
    const text = await fileUtilities.readFileAsText(file)
    const parsed = JSON.parse(text) as unknown
    await (Array.isArray(parsed)
      ? this.processHierarchy(parsed as HierNode[], options)
      : this.processHierarchy(parsed as GraphData, options))
  }

  /**
   * Process a hierarchy data structure and create the widgets on the board.
   * @param roots Root nodes of the hierarchy.
   * @param opts Additional options such as custom sort key.
   */
  public async processHierarchy(
    roots: HierNode[] | GraphData,
    options: HierarchyProcessOptions = {},
  ): Promise<void> {
    const data = this.resolveHierarchy(roots)
    this.lastCreated = []
    const placement = await this.layoutNodes(data, options)
    const frame = await this.prepareFrame(
      options.createFrame !== false,
      placement.width,
      placement.height,
      placement.spot,
      options.frameTitle,
    )
    await this.createWidgets(data, placement.result.nodes, placement.offsetX, placement.offsetY)
    log.debug(
      {
        offsetX: placement.offsetX,
        offsetY: placement.offsetY,
        frameWidth: placement.width,
        frameHeight: placement.height,
      },
      'Nested offsets applied',
    )
    const syncItems = frame
      ? this.lastCreated.filter((item) => item !== frame)
      : [...this.lastCreated]
    if (syncItems.length > 0) {
      await this.syncOrUndo(syncItems as (BaseItem | Group | Connector)[])
    }
    if (frame) {
      await this.builder.zoomTo(frame)
    } else if (this.lastCreated.length > 0) {
      await this.builder.zoomTo(this.lastCreated as (BaseItem | Group)[])
    }
  }

  private resolveHierarchy(roots: HierNode[] | GraphData): HierNode[] {
    const hierarchy = Array.isArray(roots) ? roots : edgesToHierarchy(roots)
    if (!Array.isArray(hierarchy)) {
      throw new TypeError('Invalid hierarchy')
    }
    return hierarchy
  }

  private async layoutNodes(
    nodes: HierNode[],
    options: HierarchyProcessOptions,
  ): Promise<{
    result: NestedLayoutResult
    offsetX: number
    offsetY: number
    width: number
    height: number
    spot: { x: number; y: number }
  }> {
    const result = await layoutHierarchy(nodes, {
      sortKey: options.sortKey,
      padding: options.padding,
      topSpacing: options.topSpacing,
    })
    log.info({ nodes: Object.keys(result.nodes).length }, 'Nested layout produced nodes')
    const bounds = this.computeBounds(result)
    const margin = 40
    const width = bounds.maxX - bounds.minX + margin * 2
    const height = bounds.maxY - bounds.minY + margin * 2
    const spot = await this.builder.findSpace(width, height)
    const { offsetX, offsetY } = frameOffset(
      spot,
      width,
      height,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    )
    return { result, offsetX, offsetY, width, height, spot }
  }

  private async prepareFrame(
    shouldCreateFrame: boolean,
    width: number,
    height: number,
    spot: { x: number; y: number },
    frameTitle?: string,
  ): Promise<Frame | undefined> {
    if (shouldCreateFrame) {
      return registerFrame(this.builder, this.lastCreated, width, height, spot, frameTitle)
    }
    clearActiveFrame(this.builder)
    return undefined
  }

  /**
   * Determine the overall bounding box of a layout result.
   */
  private computeBounds(result: NestedLayoutResult) {
    return boundingBoxFromCenter(result.nodes)
  }

  /**
   * Optionally create a frame around the entire hierarchy.
   */

  /**
   * Recursively create widgets for a node and its children.
   */
  private async createNodeTree(
    node: HierNode,
    posMap: Record<string, { x: number; y: number; width: number; height: number }>,
    offsetX: number,
    offsetY: number,
  ): Promise<BaseItem | Group> {
    const pos = posMap[node.id]
    if (!pos) {
      throw new Error(`Missing layout for node ${node.id}`)
    }
    const centerX = pos.x + offsetX + pos.width / 2
    const centerY = pos.y + offsetY + pos.height / 2
    const widget = await this.builder.createNode(node, {
      x: centerX,
      y: centerY,
      width: pos.width,
      height: pos.height,
    })
    this.builder.resizeItem(widget, pos.width, pos.height)

    if (!node.children?.length) {
      this.registerCreated(widget)
      return widget
    }

    const childWidgets: GroupableItem[] = []
    for (const child of node.children) {
      const childWidget = await this.createNodeTree(child, posMap, offsetX, offsetY)
      childWidgets.push(childWidget as GroupableItem)
    }

    // Remove children from undo list; they will be represented by the group.
    this.lastCreated = this.lastCreated.filter(
      (index) => !childWidgets.includes(index as GroupableItem),
    )
    const group = await this.builder.groupItems([widget as GroupableItem, ...childWidgets])
    this.registerCreated(group)
    return group
  }

  /**
   * Iterate root nodes and delegate to {@link createNodeTree}.
   */
  private async createWidgets(
    nodes: HierNode[],
    posMap: Record<string, { x: number; y: number; width: number; height: number }>,
    offsetX: number,
    offsetY: number,
  ): Promise<void> {
    for (const node of nodes) {
      await this.createNodeTree(node, posMap, offsetX, offsetY)
    }
  }

  // undoLast inherited from UndoableProcessor
}

/**
 * Shared singleton instance used by the UI layer.
 */
export const hierarchyProcessor = new HierarchyProcessor()
