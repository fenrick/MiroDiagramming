import type { BaseItem, Connector, Frame, Group, GroupableItem } from '@mirohq/websdk-types'

import type { EdgeData, EdgeHint, NodeData, PositionedNode } from '../core/graph'
import * as log from '../logger'

import { getBoard, getBoardWithQuery, maybeSync } from './board'
import type { BoardQueryLike } from './board'
import { boardCache } from './board-cache'
import { runBatch } from './batch'
import { createConnector } from './connector-utils'
import { searchGroups, searchShapes } from './node-search'
import { templateManager } from './templates'

export { updateConnector } from './connector-utils'

/** Union type representing a single widget or a group of widgets. */
export type BoardItem = BaseItem | Group

/**
 * Helper responsible for finding, creating and updating widgets on the board.
 * Validates inputs and surfaces descriptive errors that include the offending
 * values to speed up debugging.
 * TODO introduce OO based shape interactions to support planned move/update
 * operations and improve testability.
 * TODO compute data-driven board diffs so modifications can be queued and
 * persisted by the server.
 */
export class BoardBuilder {
  private frame: Frame | undefined
  /** Cached lookup map for shapes by label content. */
  private shapeMap: Map<string, BaseItem> | undefined

  /**
   * Type guard ensuring the provided value conforms to {@link NodeData}.
   */
  private static isNodeData(node: unknown): node is NodeData {
    return (
      !!node &&
      typeof node === 'object' &&
      typeof (node as Record<string, unknown>).type === 'string' &&
      typeof (node as Record<string, unknown>).label === 'string'
    )
  }

  /** Reset any builder state between runs. */
  public reset(): void {
    this.frame = undefined
    this.shapeMap = undefined
  }

  /** Assign a parent frame for subsequently created items. */
  public setFrame(frame: Frame | undefined): void {
    this.frame = frame
  }

  /** Retrieve the current frame used for new items, if any. */
  public getFrame(): Frame | undefined {
    return this.frame
  }

  /**
   * Find a free area on the board that can fit the given dimensions.
   * This uses the built-in `findEmptySpace` API starting from the
   * current viewport center.
   */
  public async findSpace(width: number, height: number): Promise<{ x: number; y: number }> {
    this.ensureBoard()
    const vp = await miro.board.viewport.get()
    const empty = await miro.board.findEmptySpace({
      width,
      height,
      x: vp.x + vp.width / 2,
      y: vp.y + vp.height / 2,
      offset: 40,
    })
    return { x: empty.x, y: empty.y }
  }

  /** Create a frame at the specified location. */
  public async createFrame(
    width: number,
    height: number,
    x: number,
    y: number,
    title?: string,
  ): Promise<Frame> {
    this.ensureBoard()
    const frame = await miro.board.createFrame({
      title: title ?? '',
      x,
      y,
      width,
      height,
    })
    this.frame = frame
    return frame
  }

  /** Move the viewport to show the provided frame or widgets. */
  public async zoomTo(target: Frame | BoardItem[]): Promise<void> {
    this.ensureBoard()
    await miro.board.viewport.zoomTo(target)
  }

  /**
   * Lookup an existing widget with matching metadata.
   *
   * Labels are expected to be stored directly on shape content or on a child
   * item within a group. No additional metadata is persisted, so duplicate
   * labels may yield ambiguous results.
   */
  public async findNode(
    type: unknown,
    label: unknown,
    board: BoardQueryLike = getBoardWithQuery(),
  ): Promise<BoardItem | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error(
        `Invalid search parameters: type=${JSON.stringify(type)}, label=${JSON.stringify(label)}`,
      )
    }
    this.ensureBoard()
    await this.loadShapeMap(board)
    const fromShapes = await searchShapes(board, this.shapeMap as Map<string, BaseItem>, label)
    if (fromShapes) {
      return fromShapes
    }
    return searchGroups(board, type, label)
  }

  /**
   * Search only the currently selected widgets for one matching the node
   * metadata. Falling back to shapes and groups mirrors {@link findNode} but
   * avoids querying the entire board. The same label-based lookup assumption
   * applies.
   */
  public async findNodeInSelection(type: unknown, label: unknown): Promise<BoardItem | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error(
        `Invalid search parameters: type=${JSON.stringify(type)}, label=${JSON.stringify(label)}`,
      )
    }
    this.ensureBoard()
    const selection = await boardCache.getSelection(getBoard())
    const board: import('./board').BoardQueryLike = {
      get: async ({ type: t }): Promise<Array<Record<string, unknown>>> =>
        selection.filter((i) => (i as { type?: string }).type === t),
      getSelection: async (): Promise<Array<Record<string, unknown>>> => selection,
    }
    const shape = await searchShapes(board, undefined, label)
    if (shape) {
      return shape
    }
    return searchGroups(board, type, label)
  }

  /** Create or update a node widget from a template. */
  public async createNode(node: unknown, pos: PositionedNode): Promise<BoardItem> {
    log.info({ type: (node as NodeData)?.type }, 'Creating node')
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error(`Invalid position: ${JSON.stringify(pos)}`)
    }
    if (!BoardBuilder.isNodeData(node)) {
      throw new Error(`Invalid node: ${JSON.stringify(node)}`)
    }
    const nodeData = node
    const templateDef = templateManager.getTemplate(nodeData.type)
    if (!templateDef) {
      throw new Error(`Template '${nodeData.type}' not found`)
    }
    const widget = await this.createNewNode(nodeData, pos)
    await this.resizeItem(widget, pos.width, pos.height)
    log.debug('Node widget created')
    return widget
  }

  /**
   * Create new connectors between nodes.
   * Existing connectors are ignored; a fresh widget is created for each edge.
   * Operations run inside {@link runBatch} to minimise API round-trips.
   */
  public async createEdges(
    edges: EdgeData[],
    nodeMap: Record<string, BoardItem>,
    hints?: EdgeHint[],
  ): Promise<Connector[]> {
    if (!Array.isArray(edges)) {
      throw new Error(`Invalid edges: ${JSON.stringify(edges)}`)
    }
    log.info({ count: edges.length }, 'Creating edges')
    if (!nodeMap || typeof nodeMap !== 'object') {
      throw new Error(`Invalid node map: ${JSON.stringify(nodeMap)}`)
    }
    const created: Connector[] = []
    // Create connectors sequentially; the Web SDK does not expose a bulk/batch API.
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!
      const from = nodeMap[edge.from]
      const to = nodeMap[edge.to]
      if (!from || !to) {
        continue
      }
      const templateName =
        typeof edge.metadata?.template === 'string' ? edge.metadata.template : 'default'
      const template = templateManager.getConnectorTemplate(templateName)
      try {
        const conn = await createConnector(edge, from, to, hints?.[i], template)
        created.push(conn)
      } catch {
        // Best-effort: skip failed connector creation and continue
      }
    }
    log.debug({ created: created.length }, 'Edges created')
    return created
  }

  /**
   * Call `.sync()` on each widget if the method exists.
   * Batched with {@link runBatch} so multiple syncs are sent together.
   */
  public async syncAll(items: Array<BoardItem | Connector>): Promise<void> {
    const board = getBoard()
    await runBatch(board, async () => {
      log.trace({ count: items.length }, 'Syncing widgets')
      await Promise.all(items.map((i) => maybeSync(i)))
    })
  }

  /**
   * Remove the provided widgets from the board.
   * Deletion is wrapped in {@link runBatch} to reduce network chatter.
   */
  public async removeItems(items: Array<BoardItem | Connector | Frame>): Promise<void> {
    this.ensureBoard()
    const board = getBoard()
    await runBatch(board, async () => {
      log.debug({ count: items.length }, 'Removing items')
      await Promise.all(items.map((item) => miro.board.remove(item)))
    })
  }

  /** Group multiple widgets together on the board. */
  public async groupItems(items: GroupableItem[]): Promise<Group> {
    this.ensureBoard()
    log.trace({ count: items.length }, 'Grouping items')
    return miro.board.group({ items })
  }

  /**
   * Resize an item if width and height properties are available.
   *
   * Synchronisation is intentionally deferred so multiple widgets can be
   * updated before calling {@link syncAll}. This reduces the number of API
   * calls when creating complex structures.
   */
  public async resizeItem(item: BoardItem, width: number, height: number): Promise<void> {
    const target = item as { width?: number; height?: number }
    if (typeof target.width === 'number') {
      target.width = width
    }
    if (typeof target.height === 'number') {
      target.height = height
    }
  }

  private ensureBoard(): void {
    if (typeof miro === 'undefined' || !miro?.board) {
      throw new Error('Miro board not initialized')
    }
  }

  /** Populate the shape cache when not yet loaded. */
  private async loadShapeMap(board: BoardQueryLike): Promise<void> {
    if (!this.shapeMap) {
      log.trace('Populating shape cache')
      const widgets = await boardCache.getWidgets(['shape'], board)
      const map = new Map<string, BaseItem>()
      for (const s of widgets) {
        const content = (s as { content?: unknown }).content
        if (typeof content === 'string' && content.trim()) {
          map.set(content, s as BaseItem)
        }
      }
      this.shapeMap = map
      log.debug({ count: map.size }, 'Shape cache ready')
    }
  }

  /**
   * Create a new widget (or group) for the node using template defaults.
   */
  private async createNewNode(node: NodeData, pos: PositionedNode): Promise<BoardItem> {
    const widget = (await templateManager.createFromTemplate(
      node.type,
      node.label,
      pos.x,
      pos.y,
      this.frame,
    )) as BoardItem
    return widget
  }
}
