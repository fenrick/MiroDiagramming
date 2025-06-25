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

import { performLayout } from './layout-core';
import type { GraphData } from '../graph';

/**
 * Layout hierarchical data using the ELK engine and compute container sizes.
 */
export class NestedLayouter {
  private sortValue(node: HierNode, key?: string): string {
    if (key && node.metadata && key in node.metadata) {
      return String(node.metadata[key]);
    }
    return node.label ?? node.id;
  }

  private buildGraph(roots: HierNode[], sortKey?: string): GraphData {
    const nodes: GraphData['nodes'] = [];
    const edges: GraphData['edges'] = [];

    const visit = (node: HierNode, parent?: HierNode): void => {
      nodes.push({
        id: node.id,
        label: node.label,
        type: node.type,
        metadata: { width: LEAF_WIDTH, height: LEAF_HEIGHT },
      });
      if (parent) edges.push({ from: parent.id, to: node.id });
      const children = node.children;
      if (!children?.length) return;
      const sorted = [...children].sort((a, b) =>
        this.sortValue(a, sortKey).localeCompare(this.sortValue(b, sortKey)),
      );
      for (const child of sorted) visit(child, node);
    };

    roots.forEach((r) => visit(r));
    return { nodes, edges };
  }

  private computeContainers(
    node: HierNode,
    map: Record<string, PositionedNode>,
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    const pos = map[node.id];
    if (!node.children?.length) {
      return {
        minX: pos.x - pos.width / 2,
        minY: pos.y - pos.height / 2,
        maxX: pos.x + pos.width / 2,
        maxY: pos.y + pos.height / 2,
      };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const child of node.children) {
      const b = this.computeContainers(child, map);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    }
    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    map[node.id] = { id: node.id, x: cx, y: cy, width, height };
    return {
      minX: cx - width / 2,
      minY: cy - height / 2,
      maxX: cx + width / 2,
      maxY: cy + height / 2,
    };
  }

  /**
   * Compute a nested layout using ELK for positioning.
   */
  public async layoutHierarchy(
    roots: HierNode[],
    opts: NestedLayoutOptions = {},
  ): Promise<NestedLayoutResult> {
    const graph = this.buildGraph(roots, opts.sortKey);
    const layout = await performLayout(graph);
    const nodes: Record<string, PositionedNode> = {};
    Object.entries(layout.nodes).forEach(([id, n]) => {
      nodes[id] = {
        id,
        x: n.x + n.width / 2,
        y: n.y + n.height / 2,
        width: n.width,
        height: n.height,
      };
    });
    roots.forEach((r) => this.computeContainers(r, nodes));
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
