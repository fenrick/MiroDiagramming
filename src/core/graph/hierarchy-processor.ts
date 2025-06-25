import { BoardBuilder } from '../../board/board-builder';
import { fileUtils } from '../utils/file-utils';
import {
  HierNode,
  layoutHierarchy,
  NestedLayoutResult,
} from '../layout/nested-layout';
import type { BaseItem, Group, Frame } from '@mirohq/websdk-types';

export interface HierarchyProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
  sortKey?: string;
}

export class HierarchyProcessor {
  private lastCreated: Array<BaseItem | Group | Frame> = [];

  constructor(private builder: BoardBuilder = new BoardBuilder()) {}

  public async processFile(
    file: File,
    opts: HierarchyProcessOptions = {},
  ): Promise<void> {
    fileUtils.validateFile(file);
    const text = await fileUtils.readFileAsText(file);
    const data = JSON.parse(text) as HierNode[];
    await this.processHierarchy(data, opts);
  }

  public async processHierarchy(
    roots: HierNode[],
    opts: HierarchyProcessOptions = {},
  ): Promise<void> {
    if (!Array.isArray(roots)) throw new Error('Invalid hierarchy');
    this.lastCreated = [];
    const result = layoutHierarchy(roots, { sortKey: opts.sortKey });
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

  private computeBounds(result: NestedLayoutResult) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    Object.values(result.nodes).forEach(({ x, y, width, height }) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    return { minX, minY, maxX, maxY };
  }

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
      this.lastCreated.push(widget);
      if (node.children?.length) {
        await this.createWidgets(node.children, posMap, offsetX, offsetY);
      }
    }
  }

  public async undoLast(): Promise<void> {
    if (this.lastCreated.length) {
      await this.builder.removeItems(this.lastCreated);
      this.lastCreated = [];
    }
  }
}

export const hierarchyProcessor = new HierarchyProcessor();
