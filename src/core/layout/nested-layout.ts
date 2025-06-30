export interface HierNode {
  id: string;
  label: string;
  type: string;
  children?: HierNode[];
  metadata?: Record<string, unknown>;
}

export interface NestedLayoutOptions {
  /** Optional metadata key used for sorting children. */
  sortKey?: string;
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NestedLayoutResult {
  nodes: Record<string, PositionedNode>;
}

const LEAF_WIDTH = 120;
const LEAF_HEIGHT = 30;
const PADDING = 20;

import { loadElk } from './elk-loader';
import type { ElkNode } from 'elkjs/lib/elk-api';

/**
 * Layout hierarchical data using the ELK engine and compute container sizes.
 */
export class NestedLayouter {
  private sortValue(node: HierNode, key?: string): string {
    const metaValue = key ? node.metadata?.[key] : undefined;
    if (metaValue !== undefined) {
      return String(metaValue);
    }
    return node.label ?? node.id;
  }

  private buildElkNode(node: HierNode, sortKey?: string): ElkNode {
    const elk: ElkNode = { id: node.id };
    const children = node.children;
    if (!children?.length) {
      elk.width = LEAF_WIDTH;
      elk.height = LEAF_HEIGHT;
      return elk;
    }
    const sorted = [...children].sort((a, b) =>
      this.sortValue(a, sortKey).localeCompare(this.sortValue(b, sortKey)),
    );
    elk.children = sorted.map((c) => this.buildElkNode(c, sortKey));
    elk.layoutOptions = {
      'elk.algorithm': 'org.eclipse.elk.rectpacking',
      'elk.spacing.nodeNode': String(PADDING),
      'elk.direction': 'RIGHT',
    };
    return elk;
  }

  public computePosition(
    node: ElkNode,
    offsetX: number,
    offsetY: number,
  ): PositionedNode | null {
    if (
      node.id !== 'root' &&
      typeof node.x === 'number' &&
      typeof node.y === 'number' &&
      typeof node.width === 'number' &&
      typeof node.height === 'number'
    ) {
      return {
        id: node.id,
        x: offsetX + node.x,
        y: offsetY + node.y,
        width: node.width,
        height: node.height,
      };
    }
    return null;
  }

  private collectPositions(
    node: ElkNode,
    map: Record<string, PositionedNode>,
    offsetX = 0,
    offsetY = 0,
  ): void {
    const pos = this.computePosition(node, offsetX, offsetY);
    if (pos) {
      map[node.id] = pos;
    }
    for (const child of node.children ?? []) {
      const childX = typeof node.x === 'number' ? offsetX + node.x : offsetX;
      const childY = typeof node.y === 'number' ? offsetY + node.y : offsetY;
      this.collectPositions(child, map, childX, childY);
    }
  }

  /**
   * Compute a nested layout using ELK for positioning.
   */
  public async layoutHierarchy(
    roots: HierNode[],
    opts: NestedLayoutOptions = {},
  ): Promise<NestedLayoutResult> {
    const elkRoot: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'org.eclipse.elk.rectpacking',
        'elk.spacing.nodeNode': String(PADDING),
      },
      children: roots.map((r) => this.buildElkNode(r, opts.sortKey)),
    };
    const Elk = await loadElk();
    const elk = new Elk();
    const result = await elk.layout(elkRoot);
    const nodes: Record<string, PositionedNode> = {};
    for (const child of result.children ?? []) {
      this.collectPositions(child, nodes);
    }
    return { nodes };
  }
}

/** Shared instance for convenience. */
export const nestedLayouter = new NestedLayouter();

/**
 * Convenience wrapper for {@link NestedLayouter.layoutHierarchy}.
 */
export function layoutHierarchy(
  roots: HierNode[],
  opts: NestedLayoutOptions = {},
): Promise<NestedLayoutResult> {
  return nestedLayouter.layoutHierarchy(roots, opts);
}
