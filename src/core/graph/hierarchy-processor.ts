import { BoardBuilder } from '../../board/board-builder';
import { fileUtils } from '../utils/file-utils';
import {
  HierNode,
  layoutHierarchy,
  NestedLayoutResult,
} from '../layout/nested-layout';
import type {
  BaseItem,
  Group,
  Frame,
  GroupableItem,
} from '@mirohq/websdk-types';

export interface HierarchyProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
  sortKey?: string;
}

/**
 * Processor responsible for creating nested diagrams where child widgets are
 * contained inside their parent shapes. Widgets are created using
 * {@link BoardBuilder} and arranged via {@link layoutHierarchy}.
 */
export class HierarchyProcessor {
  /** List of widgets created in the last run for easy undo. */
  private lastCreated: Array<BaseItem | Group | Frame> = [];

  constructor(private builder: BoardBuilder = new BoardBuilder()) {}

  /**
   * Load a hierarchical JSON file and create the corresponding diagram.
   * @param file File containing the hierarchy array.
   * @param opts Optional behaviour flags such as frame creation.
   */
  public async processFile(
    file: File,
    opts: HierarchyProcessOptions = {},
  ): Promise<void> {
    fileUtils.validateFile(file);
    const text = await fileUtils.readFileAsText(file);
    const data = JSON.parse(text) as HierNode[];
    await this.processHierarchy(data, opts);
  }

  /**
   * Process a hierarchy data structure and create the widgets on the board.
   * @param roots Root nodes of the hierarchy.
   * @param opts Additional options such as custom sort key.
   */
  public async processHierarchy(
    roots: HierNode[],
    opts: HierarchyProcessOptions = {},
  ): Promise<void> {
    if (!Array.isArray(roots)) throw new Error('Invalid hierarchy');
    this.lastCreated = [];
    const result = await layoutHierarchy(roots, { sortKey: opts.sortKey });
    const bounds = this.computeBounds(result);
    const margin = 40;
    const width = bounds.maxX - bounds.minX + margin * 2;
    const height = bounds.maxY - bounds.minY + margin * 2;
    const spot = await this.builder.findSpace(width, height);
    const offsetX = spot.x - width / 2 + margin - bounds.minX;
    const offsetY = spot.y - height / 2 + margin - bounds.minY;
    const frame = await this.createFrame(
      opts.createFrame !== false,
      width,
      height,
      spot,
      opts.frameTitle,
    );
    await this.createWidgets(roots, result.nodes, offsetX, offsetY);
    await this.builder.syncAll(this.lastCreated.filter((i) => i !== frame));
    const target = frame
      ? frame
      : (this.lastCreated as Array<BaseItem | Group>);
    await this.builder.zoomTo(target);
  }

  /**
   * Determine the overall bounding box of a layout result.
   */
  private computeBounds(result: NestedLayoutResult) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    Object.values(result.nodes).forEach(({ x, y, width, height }) => {
      const halfW = width / 2;
      const halfH = height / 2;
      minX = Math.min(minX, x - halfW);
      minY = Math.min(minY, y - halfH);
      maxX = Math.max(maxX, x + halfW);
      maxY = Math.max(maxY, y + halfH);
    });
    return { minX, minY, maxX, maxY };
  }

  /**
   * Optionally create a frame around the entire hierarchy.
   */
  private async createFrame(
    useFrame: boolean,
    width: number,
    height: number,
    spot: { x: number; y: number },
    title?: string,
  ): Promise<Frame | undefined> {
    if (!useFrame) {
      this.builder.setFrame(undefined);
      return undefined;
    }
    const frame = await this.builder.createFrame(
      width,
      height,
      spot.x,
      spot.y,
      title,
    );
    this.lastCreated.push(frame);
    return frame;
  }

  /**
   * Recursively create widgets for a node and its children.
   */
  private async createNodeTree(
    node: HierNode,
    posMap: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >,
    offsetX: number,
    offsetY: number,
  ): Promise<BaseItem | Group> {
    const pos = posMap[node.id];
    const centerX = pos.x + offsetX + pos.width / 2;
    const centerY = pos.y + offsetY + pos.height / 2;
    const widget = await this.builder.createNode(node, {
      x: centerX,
      y: centerY,
      width: pos.width,
      height: pos.height,
    });
    await this.builder.resizeItem(widget, pos.width, pos.height);

    if (!node.children?.length) {
      this.lastCreated.push(widget);
      return widget;
    }

    const childWidgets: GroupableItem[] = [];
    for (const child of node.children) {
      const childWidget = await this.createNodeTree(
        child,
        posMap,
        offsetX,
        offsetY,
      );
      childWidgets.push(childWidget as unknown as GroupableItem);
    }

    // Remove children from undo list; they will be represented by the group.
    this.lastCreated = this.lastCreated.filter(
      (i) => !childWidgets.includes(i as unknown as GroupableItem),
    );
    const group = await this.builder.groupItems([
      widget as unknown as GroupableItem,
      ...childWidgets,
    ]);
    this.lastCreated.push(group);
    return group;
  }

  /**
   * Iterate root nodes and delegate to {@link createNodeTree}.
   */
  private async createWidgets(
    nodes: HierNode[],
    posMap: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >,
    offsetX: number,
    offsetY: number,
  ): Promise<void> {
    for (const node of nodes) {
      await this.createNodeTree(node, posMap, offsetX, offsetY);
    }
  }

  /**
   * Remove widgets created in the last run from the board.
   */
  public async undoLast(): Promise<void> {
    if (this.lastCreated.length) {
      await this.builder.removeItems(this.lastCreated);
      this.lastCreated = [];
    }
  }
}

/**
 * Shared singleton instance used by the UI layer.
 */
export const hierarchyProcessor = new HierarchyProcessor();
