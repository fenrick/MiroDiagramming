import type { ElkNode } from 'elkjs/lib/elk-api';

/** ELK node extended with optional custom properties. */
export interface LayoutNode extends ElkNode {
  /** Additional properties used by the renderer. */
  properties?: Record<string, unknown>;
}

/** Options controlling spacer creation. */
export interface SpacerOptions {
  /** Spacer height inserted above children. */
  topMargin?: number;
  /** Fallback width when parent width is undefined. */
  defaultWidth?: number;
}

const DEFAULT_MARGIN = 50;
const DEFAULT_WIDTH = 200;

/**
 * Insert an invisible spacer node as the first child when missing.
 */
function insertSpacer(node: LayoutNode, opts: Required<SpacerOptions>): void {
  const children = node.children ?? [];
  if (children.length === 0) return;

  const first = children[0];
  const hasSpacer = Boolean(first?.id?.startsWith('spacer_'));
  if (hasSpacer) return;

  const spacer: LayoutNode = {
    id: `spacer_${node.id}`,
    width: node.width ?? opts.defaultWidth,
    height: opts.topMargin,
    labels: [],
    ports: [],
    properties: { invisible: true },
  };
  node.children = [spacer, ...children];
}

/** Apply rectangle packing algorithm to a parent node. */
function applyAlgorithm(node: LayoutNode): void {
  if (!node.children?.length) return;
  node.layoutOptions = node.layoutOptions || {};
  node.layoutOptions['elk.algorithm'] = 'org.eclipse.elk.rectpacking';
}

/**
 * Recursively prepare a node for ELK layout by applying rectangle packing
 * and inserting spacer nodes.
 *
 * @param node - The root node to modify in-place.
 * @param topMargin - Height of the spacer node, defaults to 50.
 * @param defaultWidth - Width used when the parent node lacks a width.
 */
export function prepareForElk(
  node: LayoutNode,
  topMargin: number = DEFAULT_MARGIN,
  defaultWidth: number = DEFAULT_WIDTH,
): void {
  if (!Array.isArray(node.children) || node.children.length === 0) return;

  applyAlgorithm(node);
  insertSpacer(node, { topMargin, defaultWidth });
  node.children.forEach(child => prepareForElk(child, topMargin, defaultWidth));
}
