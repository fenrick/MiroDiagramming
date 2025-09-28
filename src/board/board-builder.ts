import type {
  BaseItem,
  Connector,
  ConnectorStyle,
  Frame,
  Group,
  GroupableItem,
} from '@mirohq/websdk-types'
import { LRUCache } from 'lru-cache'

import type { EdgeData, EdgeHint, NodeData, PositionedNode } from '../core/graph'
import * as log from '../logger'

import { getBoard, getBoardWithQuery, maybeSync } from './board'
import type { BoardQueryLike } from './board'
import { boardCache } from './board-cache'
import { createConnector } from './connector-utils'
import { searchGroups, searchShapes } from './node-search'
import {
  ShapeInteractionManager,
  type ShapeInteraction,
  type ShapeUpdateOptions,
} from './shape-interactions'
import { templateManager } from './templates'

export { updateConnector } from './connector-utils'

/** Union type representing a single widget or a group of widgets. */
export type BoardItem = BaseItem | Group

export type BoardDiffOperation =
  | { kind: 'create'; node: NodeData }
  | { kind: 'delete'; node: NodeData }
  | { kind: 'update'; node: NodeData; previous: NodeData; changes: Partial<NodeData> }

/**
 * Helper responsible for finding, creating and updating widgets on the board.
 * Validates inputs and surfaces descriptive errors that include the offending
 * values to speed up debugging. Shape interactions are encapsulated in
 * dedicated objects and every run can queue a diff of node operations for
 * downstream persistence.
 */
export class BoardBuilder {
  private frame: Frame | undefined
  /** Cached lookup map for shapes by label content. */
  private readonly shapeCache = new LRUCache<string, BaseItem>({ max: 500 })
  /** Service encapsulating widget manipulations for shapes. */
  private readonly shapeInteractions = new ShapeInteractionManager()
  /** Queued diff operations awaiting persistence. */
  private diffQueue: BoardDiffOperation[] = []

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
    this.shapeCache.clear()
    this.diffQueue = []
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
      throw new TypeError(
        `Invalid search parameters: type=${JSON.stringify(type)}, label=${JSON.stringify(label)}`,
      )
    }
    this.ensureBoard()
    await this.loadShapeCache(board)
    const fromShapes = await searchShapes(board, this.shapeCache, label)
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
      throw new TypeError(
        `Invalid search parameters: type=${JSON.stringify(type)}, label=${JSON.stringify(label)}`,
      )
    }
    this.ensureBoard()
    const selection = await boardCache.getSelection(getBoard())
    const board: BoardQueryLike = {
      get: async ({ type: t }): Promise<Array<Record<string, unknown>>> =>
        selection.filter((item) => (item as { type?: string }).type === t),
      getSelection: async (): Promise<Array<Record<string, unknown>>> => selection,
    }
    const shape = await searchShapes(board, this.shapeCache, label)
    if (shape) {
      return shape
    }
    return searchGroups(board, type, label)
  }

  /** Create or update a node widget from a template. */
  public async createNode(node: unknown, pos: PositionedNode): Promise<BoardItem> {
    log.info({ type: (node as NodeData)?.type }, 'Creating node')
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new TypeError(`Invalid position: ${JSON.stringify(pos)}`)
    }
    if (!BoardBuilder.isNodeData(node)) {
      throw new TypeError(`Invalid node: ${JSON.stringify(node)}`)
    }
    const nodeData = node
    const templateDefinition = templateManager.getTemplate(nodeData.type)
    if (!templateDefinition) {
      throw new TypeError(`Template '${nodeData.type}' not found`)
    }
    const widget = await this.createNewNode(nodeData, pos)
    await this.resizeItem(widget, pos.width, pos.height)
    log.debug('Node widget created')
    return widget
  }

  /** Begin a low-level interaction session for the provided shape. */
  public beginShapeInteraction(item: BaseItem): ShapeInteraction {
    return this.shapeInteractions.begin(item)
  }

  /** Apply a structured update to a shape widget. */
  public async updateShape(item: BaseItem, update: ShapeUpdateOptions): Promise<void> {
    await this.shapeInteractions.update(item, update)
  }

  /** Generate and queue a diff between the current and desired node states. */
  public planNodeDiff(current: NodeData[], desired: NodeData[]): BoardDiffOperation[] {
    const ops = BoardBuilder.computeDiff(current, desired)
    this.diffQueue.push(...ops)
    return ops
  }

  /** Retrieve any queued diff operations, clearing the internal buffer. */
  public drainDiffQueue(): BoardDiffOperation[] {
    const snapshot = [...this.diffQueue]
    this.diffQueue = []
    return snapshot
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
      throw new TypeError(`Invalid edges: ${JSON.stringify(edges)}`)
    }
    log.info({ count: edges.length }, 'Creating edges')
    if (!nodeMap || typeof nodeMap !== 'object') {
      throw new TypeError(`Invalid node map: ${JSON.stringify(nodeMap)}`)
    }
    const created: Connector[] = []
    // Create connectors sequentially; the Web SDK does not expose a bulk/batch API.
    for (const [index, edge] of edges.entries()) {
      const from = nodeMap[edge.from]
      const to = nodeMap[edge.to]
      if (!from || !to) {
        continue
      }
      const templateName =
        typeof edge.metadata?.template === 'string' ? edge.metadata.template : 'default'
      const template = templateManager.getConnectorTemplate(templateName)
      try {
        const conn = await createConnector(edge, from, to, hints?.[index], template)
        await this.applyConnectorStyleOverrides(conn, edge)
        created.push(conn)
      } catch (error) {
        log.error(
          {
            edge,
            from: from.id,
            to: to.id,
            error: String(error),
          },
          'Connector creation failed',
        )
      }
    }
    log.info({ created: created.length }, 'Edges created')
    return created
  }

  private async applyConnectorStyleOverrides(connector: Connector, edge: EdgeData): Promise<void> {
    const overrides = (edge.metadata as { styleOverrides?: Record<string, unknown> } | undefined)
      ?.styleOverrides as
      | { strokeColor?: string; strokeWidth?: number; strokeStyle?: string; color?: string }
      | undefined
    if (!overrides) {
      return
    }
    const style: ConnectorStyle = {
      ...(connector.style ?? ({} as ConnectorStyle)),
    }
    if (overrides.strokeColor) {
      style.strokeColor = overrides.strokeColor
    }
    if (overrides.strokeWidth !== undefined) {
      style.strokeWidth = overrides.strokeWidth
    }
    if (overrides.strokeStyle) {
      style.strokeStyle = overrides.strokeStyle as ConnectorStyle['strokeStyle']
    }
    if (overrides.color) {
      style.color = overrides.color
    }
    connector.style = style
    await maybeSync(connector)
  }

  /**
   * Call `.sync()` on each widget if the method exists.
   * Batched with {@link runBatch} so multiple syncs are sent together.
   */
  public async syncAll(items: Array<BoardItem | Connector>): Promise<void> {
    getBoard()
    log.trace({ count: items.length }, 'Syncing widgets')
    await Promise.all(items.map((item) => maybeSync(item)))
  }

  /**
   * Remove the provided widgets from the board.
   * Deletion is wrapped in {@link runBatch} to reduce network chatter.
   */
  public async removeItems(items: Array<BoardItem | Connector | Frame>): Promise<void> {
    this.ensureBoard()
    log.debug({ count: items.length }, 'Removing items')
    // Remove sequentially to avoid any hidden batching assumptions
    for (const item of items) {
      await miro.board.remove(item)
    }
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
    // Use Reflect.set to handle SDK proxies and non-enumerable props reliably
    try {
      const before = {
        w: (item as { width?: number }).width,
        h: (item as { height?: number }).height,
      }
      Reflect.set(item as object, 'width', width)
      Reflect.set(item as object, 'height', height)
      const after = {
        w: (item as { width?: number }).width,
        h: (item as { height?: number }).height,
      }
      log.info({ before, after }, 'Resize item')
    } catch {
      // ignore assignment failures; sync will no-op if values didn't change
    }
  }

  private ensureBoard(): void {
    if (typeof miro === 'undefined' || !miro?.board) {
      throw new TypeError('Miro board not initialized')
    }
  }

  /** Populate the shape cache when not yet loaded. */
  private async loadShapeCache(board: BoardQueryLike): Promise<void> {
    if (this.shapeCache.size > 0) {
      return
    }
    log.trace('Populating shape cache')
    const widgets = await boardCache.getWidgets(['shape'], board)
    for (const s of widgets) {
      const content = (s as { content?: unknown }).content
      if (typeof content === 'string' && content.trim()) {
        this.shapeCache.set(content, s as BaseItem)
      }
    }
    log.debug({ count: this.shapeCache.size }, 'Shape cache ready')
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
      { width: pos.width, height: pos.height },
    )) as BoardItem
    log.info(
      { id: node.id, x: pos.x, y: pos.y, w: pos.width, h: pos.height },
      'Create node at size',
    )
    return widget
  }

  private static computeDiff(current: NodeData[], desired: NodeData[]): BoardDiffOperation[] {
    const currentMap = new Map(current.map((n) => [n.id, n]))
    const visited = new Set<string>()
    const ops: BoardDiffOperation[] = []

    for (const node of desired) {
      const existing = currentMap.get(node.id)
      if (!existing) {
        ops.push({ kind: 'create', node })
        continue
      }
      visited.add(node.id)
      const changes = BoardBuilder.computeNodeChanges(existing, node)
      if (changes) {
        ops.push({ kind: 'update', node, previous: existing, changes })
      }
    }

    for (const node of current) {
      if (!visited.has(node.id)) {
        ops.push({ kind: 'delete', node })
      }
    }
    return ops
  }

  private static computeNodeChanges(previous: NodeData, next: NodeData): Partial<NodeData> | null {
    const delta: Partial<NodeData> = {}
    if (previous.label !== next.label) {
      delta.label = next.label
    }
    if (previous.type !== next.type) {
      delta.type = next.type
    }
    if (!BoardBuilder.metadataEqual(previous.metadata, next.metadata)) {
      delta.metadata = next.metadata ?? {}
    }
    return Object.keys(delta).length > 0 ? delta : null
  }

  private static metadataEqual(
    a: Record<string, unknown> | undefined,
    b: Record<string, unknown> | undefined,
  ): boolean {
    const normalize = (meta: Record<string, unknown> | undefined) =>
      JSON.stringify(BoardBuilder.formatMeta(meta ?? {}))
    return normalize(a) === normalize(b)
  }

  private static formatMeta(value: Record<string, unknown>): Record<string, unknown> {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, BoardBuilder.formatMetaValue(v)] as const)
      .toSorted(([a], [b]) => a.localeCompare(b))
    return Object.fromEntries(entries)
  }

  private static formatMetaValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((v) => BoardBuilder.formatMetaValue(v))
    }
    if (value && typeof value === 'object') {
      return BoardBuilder.formatMeta(value as Record<string, unknown>)
    }
    return value
  }
}
