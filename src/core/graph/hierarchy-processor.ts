import { BoardBuilder } from '../../board/board-builder';
import { maybeCreateFrame } from '../../board/frame-utils';
import { undoWidgets, syncOrUndo } from '../../board/undo-utils';
import { fileUtils } from '../utils/file-utils';
import { boundingBox, frameOffset } from '../layout/layout-utils';
import {
  HierNode,
  layoutHierarchy,
  NestedLayoutResult,
} from '../layout/nested-layout';
import { edgesToHierarchy } from './convert';
import type { GraphData } from './graph-service';
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

  /**
   * Access widgets created during the last processing run.
   */
  public getLastCreated(): Array<BaseItem | Group | Frame> {
    return this.lastCreated;
  }

  constructor(private readonly builder: BoardBuilder = new BoardBuilder()) {}

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
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      await this.processHierarchy(parsed as HierNode[], opts);
    } else {
      await this.processHierarchy(parsed as GraphData, opts);
    }
  }

  /**
   * Process a hierarchy data structure and create the widgets on the board.
   * @param roots Root nodes of the hierarchy.
   * @param opts Additional options such as custom sort key.
   */
  public async processHierarchy(
    roots: HierNode[] | GraphData,
    opts: HierarchyProcessOptions = {},
  ): Promise<void> {
    const data = Array.isArray(roots) ? roots : edgesToHierarchy(roots);
    if (!Array.isArray(data)) throw new Error('Invalid hierarchy');
    this.lastCreated = [];
    const result = await layoutHierarchy(data, { sortKey: opts.sortKey });
    const bounds = this.computeBounds(result);
    const margin = 40;
    const width = bounds.maxX - bounds.minX + margin * 2;
    const height = bounds.maxY - bounds.minY + margin * 2;
    const spot = await this.builder.findSpace(width, height);
    const { offsetX, offsetY } = frameOffset(
      spot,
      width,
      height,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    );
    const frame = await maybeCreateFrame(
      this.builder,
      this.lastCreated,
      opts.createFrame !== false,
      width,
      height,
      spot,
      opts.frameTitle,
    );
    await this.createWidgets(data, result.nodes, offsetX, offsetY);
    const syncItems = this.lastCreated.filter((i) => i !== frame);
    await syncOrUndo(this.builder, this.lastCreated, syncItems);
    const target = frame
      ? frame
      : (this.lastCreated as Array<BaseItem | Group>);
    await this.builder.zoomTo(target);
  }

  /**
   * Determine the overall bounding box of a layout result.
   */
  private computeBounds(result: NestedLayoutResult) {
    return boundingBox(result.nodes, true);
  }

  /**
   * Optionally create a frame around the entire hierarchy.
   */

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
    await undoWidgets(this.builder, this.lastCreated);
  }
}

/**
 * Shared singleton instance used by the UI layer.
 */
export const hierarchyProcessor = new HierarchyProcessor();
