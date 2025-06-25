import { templateManager } from '../../board/templates';

export interface HierNode {
  id: string;
  label: string;
  type: string;
  children?: HierNode[];
  metadata?: Record<string, unknown>;
}

export interface NestedLayoutOptions {
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
const DEFAULT_SIZE = 160;

function templateSize(type: string): { width: number; height: number } {
  const tpl = templateManager.getTemplate(type);
  const element = tpl?.elements.find((e) => e.width && e.height);
  const width = element?.width ?? DEFAULT_SIZE;
  const height = element?.height ?? width / GOLDEN_RATIO;
  return { width, height };
}

function sortValue(node: HierNode, key?: string): string {
  if (key && node.metadata && key in node.metadata) {
    return String(node.metadata[key]);
  }
  return node.label ?? node.id;
}

function layoutChildren(
  node: HierNode,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  map: Record<string, PositionedNode>,
  opts: NestedLayoutOptions,
): void {
  map[node.id] = { id: node.id, x: centerX, y: centerY, width, height };
  const children = node.children;
  if (!children?.length) return;
  const sorted = [...children].sort((a, b) =>
    sortValue(a, opts.sortKey).localeCompare(sortValue(b, opts.sortKey)),
  );
  const marginX = width * 0.1;
  const marginY = height * 0.2;
  const innerW = width - marginX * 2;
  const innerH = height - marginY * 2;
  const cols = Math.ceil(Math.sqrt(sorted.length * GOLDEN_RATIO));
  const rows = Math.ceil(sorted.length / cols);
  const cellW = innerW / cols;
  const cellH = innerH / rows;
  sorted.forEach((child, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = centerX - width / 2 + marginX + col * cellW + cellW / 2;
    const cy = centerY - height / 2 + marginY + row * cellH + cellH / 2;
    const dims = templateSize(child.type);
    const cw = Math.min(dims.width, cellW);
    const ch = Math.min(dims.height, cellH);
    layoutChildren(child, cx, cy, cw, ch, map, opts);
  });
}

/**
 * Compute a nested layout where child nodes are contained within their parent.
 * Nodes are sorted alphabetically by label unless a custom key is provided.
 */
export function layoutHierarchy(
  roots: HierNode[],
  opts: NestedLayoutOptions = {},
): NestedLayoutResult {
  const nodes: Record<string, PositionedNode> = {};
  let offsetY = 0;
  const gap = 40;
  roots.forEach((root) => {
    const size = templateSize(root.type);
    const y = offsetY + size.height / 2;
    layoutChildren(
      root,
      size.width / 2,
      y,
      size.width,
      size.height,
      nodes,
      opts,
    );
    offsetY += size.height + gap;
  });
  return { nodes };
}
