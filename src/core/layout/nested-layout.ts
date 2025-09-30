export interface HierNode {
  id: string
  label: string
  type: string
  children?: HierNode[]
  metadata?: Record<string, unknown>
}

export interface NestedLayoutOptions {
  /** Optional metadata key used for sorting children. */
  sortKey?: string
  /** Spacing between sibling nodes. */
  padding?: number
  /** Height of the invisible spacer inserted above children. */
  topSpacing?: number
}

export interface PositionedNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface NestedLayoutResult {
  nodes: Record<string, PositionedNode>
}

const LEAF_WIDTH = 120
const LEAF_HEIGHT = 30
const DEFAULT_PADDING = 20
const DEFAULT_TOP_SPACING = 50

import type { ElkNode } from 'elkjs/lib/elk-api'

import * as log from '../../logger'

import { loadElk } from './elk-loader'
import { getNodeDimensions } from './layout-core'
import type { LayoutNode } from './elk-preprocessor'
import { prepareForElk } from './elk-preprocessor'

/**
 * Layout hierarchical data using the ELK engine and compute container sizes.
 */
export class NestedLayouter {
  public computePosition(node: ElkNode, offsetX: number, offsetY: number): PositionedNode | null {
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
      }
    }
    return null
  }

  /**
   * Compute a nested layout using ELK for positioning.
   */
  public async layoutHierarchy(
    roots: HierNode[],
    options: NestedLayoutOptions = {},
  ): Promise<NestedLayoutResult> {
    const padding = options.padding ?? DEFAULT_PADDING
    const topSpacing = options.topSpacing ?? DEFAULT_TOP_SPACING
    const elkRoot: LayoutNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'org.eclipse.elk.rectpacking',
        'elk.spacing.nodeNode': String(padding),
      },
      children: roots.map((r) => this.buildElkNode(r, options.sortKey, padding)),
    }
    prepareForElk(elkRoot, topSpacing, LEAF_WIDTH)
    const Elk = await loadElk()
    const elk = new Elk()
    const result = await elk.layout(elkRoot)
    const sizes: { id: string; w: number; h: number }[] = []
    for (const child of result.children ?? []) {
      this.collectDebugSizes(child, sizes)
    }
    log.info({ count: sizes.length, sizes }, 'ELK nested sizes')
    const nodeMap = new Map<string, PositionedNode>()
    for (const child of result.children ?? []) {
      this.collectPositions(child, nodeMap)
    }
    const nodes = Object.fromEntries(nodeMap)
    return { nodes }
  }

  private collectDebugSizes(node: ElkNode, out: { id: string; w: number; h: number }[]): void {
    if (typeof node.width === 'number' && typeof node.height === 'number') {
      out.push({ id: node.id, w: node.width, h: node.height })
    }
    for (const child of node.children ?? []) {
      this.collectDebugSizes(child, out)
    }
  }

  private sortValue(node: HierNode, key?: string): string {
    const meta = metadataValueAsString(node.metadata, key)
    if (meta !== null) {
      return meta
    }
    return node.label
  }

  private buildElkNode(
    node: HierNode,
    sortKey?: string,
    padding: number = DEFAULT_PADDING,
  ): ElkNode {
    const elk: ElkNode = { id: node.id }
    const children = node.children
    if (!children?.length) {
      const dims = getNodeDimensions({ type: node.type, metadata: node.metadata })
      const width = Number.isFinite(dims.width) ? dims.width : LEAF_WIDTH
      const height = Number.isFinite(dims.height) ? dims.height : LEAF_HEIGHT
      elk.width = width
      elk.height = height
      return elk
    }
    const sorted = children.toSorted((a, b) =>
      this.sortValue(a, sortKey).localeCompare(this.sortValue(b, sortKey)),
    )
    elk.children = sorted.map((c) => this.buildElkNode(c, sortKey, padding))
    elk.layoutOptions = {
      'elk.algorithm': 'org.eclipse.elk.rectpacking',
      'elk.spacing.nodeNode': String(padding),
      'elk.direction': 'RIGHT',
    }
    return elk
  }

  private collectChildPositions(
    node: ElkNode,
    map: Map<string, PositionedNode>,
    offsetX: number,
    offsetY: number,
  ): void {
    const childX = (typeof node.x === 'number' ? node.x : 0) + offsetX
    const childY = (typeof node.y === 'number' ? node.y : 0) + offsetY
    for (const child of node.children ?? []) {
      this.collectPositions(child, map, childX, childY)
    }
  }

  private collectPositions(
    node: ElkNode,
    map: Map<string, PositionedNode>,
    offsetX = 0,
    offsetY = 0,
  ): void {
    const pos = this.computePosition(node, offsetX, offsetY)
    // Skip spacer nodes that only influence layout sizing
    const nodeId = node.id
    const isInvisible =
      (node as LayoutNode).properties?.invisible === true || nodeId.startsWith('spacer_')
    if (pos && !isInvisible) {
      map.set(nodeId, pos)
    }
    this.collectChildPositions(node, map, offsetX, offsetY)
  }
}

/** Shared instance for convenience. */
export const nestedLayouter = new NestedLayouter()

/**
 * Convenience wrapper for {@link NestedLayouter.layoutHierarchy}.
 */
export function layoutHierarchy(
  roots: HierNode[],
  options: NestedLayoutOptions = {},
): Promise<NestedLayoutResult> {
  return nestedLayouter.layoutHierarchy(roots, options)
}

const metadataValueAsString = (
  metadata: Record<string, unknown> | undefined,
  key?: string,
): string | null => {
  if (!key || !metadata || typeof metadata !== 'object') {
    return null
  }
  const entry = Object.entries(metadata).find(([entryKey]) => entryKey === key)
  if (!entry) {
    return null
  }
  const [, value] = entry
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}
