import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs/lib/elk-api';
import { GraphData } from './graph';
import { templateManager } from '../board/templates';
import { UserLayoutOptions, validateLayoutOptions } from './elk-options';

/**
 * Node with layout coordinates returned from ELK.
 */
export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Edge segment coordinates as returned by ELK.
 */
export interface PositionedEdge {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  bendPoints?: { x: number; y: number }[];
}

// Fallback dimensions for nodes when templates omit width or height
const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 110;

/**
 * Grouped layout results for nodes and edges.
 */
export interface LayoutResult {
  nodes: Record<string, PositionedNode>;
  edges: PositionedEdge[];
}

/**
 * Run the ELK layout engine on the provided graph data and
 * return positioned nodes and edges.
 */
export class LayoutEngine {
  private static instance: LayoutEngine;
  private elk = new ELK();

  private constructor() {}

  /** Access the shared layout engine instance. */
  public static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) {
      LayoutEngine.instance = new LayoutEngine();
    }
    return LayoutEngine.instance;
  }

  /**
   * Run the ELK layout engine on the provided graph data and
   * return positioned nodes and edges.
   *
   * @param data - Parsed graph data.
   * @param opts - Optional layout customisation parameters.
   */
  public async layoutGraph(
    data: GraphData,
    opts: Partial<UserLayoutOptions> = {},
  ): Promise<LayoutResult> {
    const userOpts = validateLayoutOptions(opts);
    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions: {
        // Basic layered layout configuration
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        'elk.algorithm': userOpts.algorithm,
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'elk.layered.mergeEdges': 'false',
        'elk.direction': userOpts.direction,
        'elk.layered.spacing.nodeNodeBetweenLayers': String(userOpts.spacing),
        'elk.spacing.nodeNode': userOpts.spacing as unknown as string,
        'elk.layered.unnecessaryBendpoints': 'true',
        'elk.layered.cycleBreaking.strategy': 'GREEDY',
      },
      // Each node uses its template dimensions unless overridden by metadata
      children: data.nodes.map(n => {
        const tpl = templateManager.getTemplate(n.type);
        const dims = tpl?.elements.find(e => e.width && e.height);
        // istanbul ignore next: fall back to template or default dimensions
        const width =
          (n.metadata as { width?: number } | undefined)?.width ??
          dims?.width ??
          DEFAULT_WIDTH;
        // istanbul ignore next: fall back to template or default dimensions
        const height =
          (n.metadata as { height?: number } | undefined)?.height ??
          dims?.height ??
          DEFAULT_HEIGHT;
        return { id: n.id, width, height };
      }),
      edges: data.edges.map((e, idx) => ({
        id: `e${idx}`,
        sources: [e.from],
        targets: [e.to],
      })),
    };

    const layouted = await this.elk.layout(elkGraph);
    const nodes: Record<string, PositionedNode> = {};
    const edges: PositionedEdge[] = [];
    // Convert ELK child nodes to a lookup table by id
    for (const child of layouted.children || []) {
      nodes[child.id] = {
        id: child.id,
        // istanbul ignore next: defaults for missing layout positions
        x: child.x || 0,
        // istanbul ignore next
        y: child.y || 0,
        // istanbul ignore next
        width: child.width || DEFAULT_WIDTH,
        // istanbul ignore next
        height: child.height || DEFAULT_HEIGHT,
      };
    }
    // Capture the first section of each edge for connector placement hints
    for (const edge of layouted.edges || []) {
      const section = edge.sections?.[0];
      if (!section) continue;
      edges.push({
        startPoint: section.startPoint,
        endPoint: section.endPoint,
        bendPoints: section.bendPoints,
      });
    }
    return { nodes, edges };
  }
}

export const layoutEngine = LayoutEngine.getInstance();
