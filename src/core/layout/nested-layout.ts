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

const GOLDEN_RATIO = 1.618;
const LEAF_WIDTH = 120;
const LEAF_HEIGHT = 30;
const PADDING = 20;

/**
 * Helper class that positions hierarchical nodes using an intrinsic grid
 * computed from the golden ratio. Children are sorted alphabetically unless a
 * specific metadata key is provided.
 */
export class NestedLayouter {
  /** Cache of measured node sizes. */
  private sizes: Record<string, { width: number; height: number }> = {};

  /** Sorted child order for each node. */
  private order: Record<string, HierNode[]> = {};

  /** Determine a leaf node's size. */
  private leafSize(): { width: number; height: number } {
    return { width: LEAF_WIDTH, height: LEAF_HEIGHT };
  }

  /** Retrieve the sort value for a node. */
  private sortValue(node: HierNode, key?: string): string {
    if (key && node.metadata && key in node.metadata) {
      return String(node.metadata[key]);
    }
    return node.label ?? node.id;
  }

  /**
   * Measure a node and its children, recording sizes in {@link sizes}.
   */
  private measure(
    node: HierNode,
    opts: NestedLayoutOptions,
  ): { width: number; height: number } {
    const children = node.children;
    if (!children?.length) {
      const size = this.leafSize();
      this.sizes[node.id] = size;
      return size;
    }

    const sorted = [...children].sort((a, b) =>
      this.sortValue(a, opts.sortKey).localeCompare(
        this.sortValue(b, opts.sortKey),
      ),
    );
    this.order[node.id] = sorted;
    const childSizes = sorted.map((child) => this.measure(child, opts));
    const maxW = Math.max(...childSizes.map((s) => s.width));
    const maxH = Math.max(...childSizes.map((s) => s.height));
    const cols = Math.ceil(Math.sqrt(sorted.length * GOLDEN_RATIO));
    const rows = Math.ceil(sorted.length / cols);
    const width = cols * maxW + PADDING * 2;
    const height = rows * maxH + PADDING * 2;
    this.sizes[node.id] = { width, height };
    return { width, height };
  }

  /**
   * Recursively position a node and its children.
   */
  private place(
    node: HierNode,
    centerX: number,
    centerY: number,
    map: Record<string, PositionedNode>,
  ): void {
    const { width, height } = this.sizes[node.id];
    map[node.id] = { id: node.id, x: centerX, y: centerY, width, height };
    const children = this.order[node.id];
    if (!children?.length) return;
    const cols = Math.ceil(Math.sqrt(children.length * GOLDEN_RATIO));
    const childSizes = children.map((c) => this.sizes[c.id]);
    const maxW = Math.max(...childSizes.map((s) => s.width));
    const maxH = Math.max(...childSizes.map((s) => s.height));
    const x0 = centerX - width / 2 + PADDING + maxW / 2;
    const y0 = centerY - height / 2 + PADDING + maxH / 2;
    children.forEach((child, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = x0 + col * maxW;
      const cy = y0 + row * maxH;
      this.place(child, cx, cy, map);
    });
  }

  /**
   * Compute a nested layout where child nodes are contained within their
   * parent.
   */
  public layoutHierarchy(
    roots: HierNode[],
    opts: NestedLayoutOptions = {},
  ): NestedLayoutResult {
    this.sizes = {};
    this.order = {};
    const nodes: Record<string, PositionedNode> = {};
    roots.forEach((root) => this.measure(root, opts));
    let offsetY = 0;
    const gap = 40;
    roots.forEach((root) => {
      const size = this.sizes[root.id];
      const y = offsetY + size.height / 2;
      this.place(root, size.width / 2, y, nodes);
      offsetY += size.height + gap;
    });
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
): NestedLayoutResult {
  return nestedLayouter.layoutHierarchy(roots, opts);
}
