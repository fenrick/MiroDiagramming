import type {
  BaseItem,
  Connector,
  Frame,
  Group,
  GroupableItem,
  Shape,
} from '@mirohq/websdk-types';
import type {
  EdgeData,
  EdgeHint,
  NodeData,
  PositionedNode,
} from '../core/graph';
import { log } from '../logger';
import { maybeSync } from './board';
import { boardCache } from './board-cache';
import { createConnector } from './connector-utils';
import { searchGroups, searchShapes } from './node-search';
import { templateManager } from './templates';

export { updateConnector } from './connector-utils';

/** Union type representing a single widget or a group of widgets. */
export type BoardItem = BaseItem | Group;

/**
 * Helper responsible for finding, creating and updating widgets on the board.
 * TODO introduce OO based shape interactions to support planned move/update
 * operations and improve testability.
 * TODO compute data-driven board diffs so modifications can be queued and
 * persisted by the server.
 */
export class BoardBuilder {
  private frame: Frame | undefined;
  /** Cached lookup map for shapes by label content. */
  private shapeMap: Map<string, BaseItem> | undefined;

  /**
   * Type guard ensuring the provided value conforms to {@link NodeData}.
   */
  private static isNodeData(node: unknown): node is NodeData {
    return (
      !!node &&
      typeof node === 'object' &&
      typeof (node as Record<string, unknown>).type === 'string' &&
      typeof (node as Record<string, unknown>).label === 'string'
    );
  }

  /** Reset any builder state between runs. */
  public reset(): void {
    this.frame = undefined;
    this.shapeMap = undefined;
  }

  /** Assign a parent frame for subsequently created items. */
  public setFrame(frame: Frame | undefined): void {
    this.frame = frame;
  }

  /** Retrieve the current frame used for new items, if any. */
  public getFrame(): Frame | undefined {
    return this.frame;
  }

  /**
   * Find a free area on the board that can fit the given dimensions.
   * This uses the built-in `findEmptySpace` API starting from the
   * current viewport center.
   */
  public async findSpace(
    width: number,
    height: number,
  ): Promise<{ x: number; y: number }> {
    this.ensureBoard();
    const vp = await miro.board.viewport.get();
    const empty = await miro.board.findEmptySpace({
      width,
      height,
      x: vp.x + vp.width / 2,
      y: vp.y + vp.height / 2,
      offset: 40,
    });
    return { x: empty.x, y: empty.y };
  }

  /** Create a frame at the specified location. */
  public async createFrame(
    width: number,
    height: number,
    x: number,
    y: number,
    title?: string,
  ): Promise<Frame> {
    this.ensureBoard();
    const frame = await miro.board.createFrame({
      title: title ?? '',
      x,
      y,
      width,
      height,
    });
    this.frame = frame;
    return frame;
  }

  /** Move the viewport to show the provided frame or widgets. */
  public async zoomTo(target: Frame | BoardItem[]): Promise<void> {
    this.ensureBoard();
    await miro.board.viewport.zoomTo(target);
  }

  /** Lookup an existing widget with matching metadata. */
  public async findNode(
    type: unknown,
    label: unknown,
  ): Promise<BoardItem | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error('Invalid search parameters');
    }
    this.ensureBoard();
    await this.loadShapeMap();
    const fromShapes = await searchShapes(
      miro.board as unknown as import('./board').BoardQueryLike,
      this.shapeMap as Map<string, BaseItem>,
      label,
    );
    if (fromShapes) {
      return fromShapes;
    }
    return searchGroups(
      miro.board as unknown as import('./board').BoardQueryLike,
      type,
      label,
    );
  }

  /**
   * Search only the currently selected widgets for one matching the node
   * metadata. Falling back to shapes and groups mirrors {@link findNode} but
   * avoids querying the entire board.
   */
  public async findNodeInSelection(
    type: unknown,
    label: unknown,
  ): Promise<BoardItem | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error('Invalid search parameters');
    }
    this.ensureBoard();
    const selection = await boardCache.getSelection(
      miro.board as unknown as import('./board').BoardLike,
    );
    const board: import('./board').BoardQueryLike = {
      get: async ({ type: t }) =>
        selection.filter(i => (i as { type?: string }).type === t),
      getSelection: async () => selection,
    };
    const shape = await searchShapes(board, undefined, label);
    if (shape) {
      return shape;
    }
    return searchGroups(board, type, label);
  }

  /** Create or update a node widget from a template. */
  public async createNode(
    node: unknown,
    pos: PositionedNode,
  ): Promise<BoardItem> {
    log.info({ type: (node as NodeData)?.type }, 'Creating node');
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error('Invalid position');
    }
    if (!BoardBuilder.isNodeData(node)) {
      throw new Error('Invalid node');
    }
    const nodeData = node;
    const templateDef = templateManager.getTemplate(nodeData.type);
    if (!templateDef) {
      throw new Error(`Template '${nodeData.type}' not found`);
    }
    const widget = await this.createNewNode(nodeData, pos);
    await this.resizeItem(widget, pos.width, pos.height);
    log.debug('Node widget created');
    return widget;
  }

  /**
   * Create new connectors between nodes.
   * Existing connectors are ignored; a fresh widget is created for each edge.
   */
  public async createEdges(
    edges: EdgeData[],
    nodeMap: Record<string, BoardItem>,
    hints?: EdgeHint[],
  ): Promise<Connector[]> {
    if (!Array.isArray(edges)) {
      throw new Error('Invalid edges');
    }
    log.info({ count: edges.length }, 'Creating edges');
    if (!nodeMap || typeof nodeMap !== 'object') {
      throw new Error('Invalid node map');
    }
    const created = await this.runBatch(async () => {
      const connectors = await Promise.all(
        edges.map(async (edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) {
            return undefined;
          }
          const templateName =
            typeof edge.metadata?.template === 'string'
              ? edge.metadata.template
              : 'default';
          const template = templateManager.getConnectorTemplate(templateName);
          return createConnector(edge, from, to, hints?.[i], template);
        }),
      );
      return connectors.filter(Boolean) as Connector[];
    });
    log.debug({ created: created.length }, 'Edges created');
    return created;
  }

  /** Call `.sync()` on each widget if the method exists. */
  public async syncAll(items: Array<BoardItem | Connector>): Promise<void> {
    await this.runBatch(async () => {
      log.trace({ count: items.length }, 'Syncing widgets');
      await Promise.all(items.map(i => maybeSync(i)));
    });
  }

  /** Remove the provided widgets from the board. */
  public async removeItems(
    items: Array<BoardItem | Connector | Frame>,
  ): Promise<void> {
    await this.runBatch(async () => {
      this.ensureBoard();
      log.debug({ count: items.length }, 'Removing items');
      await Promise.all(items.map(item => miro.board.remove(item)));
    });
  }

  /** Group multiple widgets together on the board. */
  public async groupItems(items: GroupableItem[]): Promise<Group> {
    this.ensureBoard();
    log.trace({ count: items.length }, 'Grouping items');
    return miro.board.group({ items });
  }

  /**
   * Resize an item if width and height properties are available.
   *
   * Synchronisation is intentionally deferred so multiple widgets can be
   * updated before calling {@link syncAll}. This reduces the number of API
   * calls when creating complex structures.
   */
  public async resizeItem(
    item: BoardItem,
    width: number,
    height: number,
  ): Promise<void> {
    const target = item as { width?: number; height?: number };
    if (typeof target.width === 'number') {
      target.width = width;
    }
    if (typeof target.height === 'number') {
      target.height = height;
    }
  }

  private ensureBoard(): void {
    if (typeof miro === 'undefined' || !miro?.board) {
      throw new Error('Miro board not initialized');
    }
  }

  /**
   * Search board shapes for metadata that matches the given type and label.
   * Returns the corresponding item if found.
   */

  /**
   * Execute multiple board operations within a batch transaction when
   * supported by the API. Falls back to sequential execution if the
   * transactional methods are unavailable.
   *
   * @param fn - Callback containing board operations to perform.
   * @returns Result of the callback.
   */
  private async runBatch<T>(fn: () => Promise<T>): Promise<T> {
    this.ensureBoard();
    const board = miro.board as unknown as import('./board').BoardLike;
    if (typeof board.startBatch === 'function') {
      await board.startBatch();
      try {
        const result = await fn();
        await board.endBatch?.();
        return result;
      } catch (err) {
        await board.abortBatch?.();
        throw err;
      }
    }
    return fn();
  }

  /**
   * Find an item whose metadata satisfies the provided predicate.
   * Metadata for all items is loaded concurrently for efficiency.
   */
  /**
   * Populate the shape cache when not yet loaded.
   *
   * Widgets are fetched via {@link boardCache.getWidgets} so repeated lookups
   * avoid additional network requests.
   */
  private async loadShapeMap(): Promise<void> {
    if (!this.shapeMap) {
      this.ensureBoard();
      log.trace('Populating shape cache');
      const shapes = (await boardCache.getWidgets(
        ['shape'],
        miro.board as unknown as import('./board').BoardQueryLike,
      )) as unknown as Shape[];
      const map = new Map<string, BaseItem>();
      shapes
        .filter(s => typeof s.content === 'string' && s.content.trim())
        .forEach(s => map.set(s.content, s as BaseItem));
      this.shapeMap = map;
      log.debug({ count: map.size }, 'Shape cache ready');
    }
  }

  /**
   * Create a new widget (or group) for the node using template defaults.
   */
  private async createNewNode(
    node: NodeData,
    pos: PositionedNode,
  ): Promise<BoardItem> {
    const widget = (await templateManager.createFromTemplate(
      node.type,
      node.label,
      pos.x,
      pos.y,
      this.frame,
    )) as BoardItem;
    return widget;
  }
}
