import type { BaseItem, Connector, Frame, Group, GroupableItem } from '@mirohq/websdk-types'

import * as log from '../../logger'
import { BoardBuilder } from '../../board/board-builder'
import { clearActiveFrame, registerFrame } from '../../board/frame-utilities'
import { boundingBoxFromCenter, frameOffset } from '../layout/layout-utils'
import { type HierNode, layoutHierarchy, type NestedLayoutResult } from '../layout/nested-layout'
import { fileUtils as fileUtilities } from '../utils/file-utils'

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
    const data = Array.isArray(roots) ? roots : edgesToHierarchy(roots)
    if (!Array.isArray(data)) {
      throw new TypeError('Invalid hierarchy')
    }
    this.lastCreated = []
    const result = await layoutHierarchy(data, {
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
    let frame: Frame | undefined
    if (options.createFrame === false) {
      clearActiveFrame(this.builder)
    } else {
      frame = await registerFrame(
        this.builder,
        this.lastCreated,
        width,
        height,
        spot,
        options.frameTitle,
      )
    }
    await this.createWidgets(data, result.nodes, offsetX, offsetY)
    log.debug(
      { offsetX, offsetY, frameWidth: width, frameHeight: height },
      'Nested offsets applied',
    )
    const syncItems = this.lastCreated.filter((index) => index !== frame)
    await this.syncOrUndo(syncItems as Array<BaseItem | Group | Connector>)
    const target = frame ?? (this.lastCreated as Array<BaseItem | Group>)
    await this.builder.zoomTo(target)
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
    await this.builder.resizeItem(widget, pos.width, pos.height)

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
