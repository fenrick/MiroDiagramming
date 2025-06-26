import { loadElk } from './elk-loader';
import type { ElkNode } from 'elkjs/lib/elk-api';
import { GraphData } from '../graph';
import { templateManager } from '../../board/templates';
import { UserLayoutOptions, validateLayoutOptions } from './elk-options';

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedEdge {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  bendPoints?: { x: number; y: number }[];
}

const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 110;

export interface LayoutResult {
  nodes: Record<string, PositionedNode>;
  edges: PositionedEdge[];
}

/**
 * Run the ELK layout engine on the provided graph data.
 */
export async function performLayout(
  data: GraphData,
  opts: Partial<UserLayoutOptions> = {},
): Promise<LayoutResult> {
  const Elk = await loadElk();
  const elk = new Elk();
  const userOpts = validateLayoutOptions(opts);
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.algorithm': userOpts.algorithm,
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.mergeEdges': 'false',
      'elk.direction': userOpts.direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': String(userOpts.spacing),
      'elk.spacing.nodeNode': userOpts.spacing as unknown as string,
      'elk.layered.unnecessaryBendpoints': 'true',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      ...(userOpts.aspectRatio && {
        'elk.aspectRatio': String(userOpts.aspectRatio),
      }),
      ...(userOpts.edgeRouting && { 'elk.edgeRouting': userOpts.edgeRouting }),
      ...(userOpts.edgeRoutingMode && {
        'elk.mrtree.edgeRoutingMode': userOpts.edgeRoutingMode,
      }),
      ...(userOpts.optimizationGoal && {
        'elk.rectpacking.widthApproximation.optimizationGoal':
          userOpts.optimizationGoal,
      }),
    },
    children: data.nodes.map((n) => {
      const tpl = templateManager.getTemplate(n.type);
      const dims = tpl?.elements.find((e) => e.width && e.height);
      const width =
        (n.metadata as { width?: number } | undefined)?.width ??
        dims?.width ??
        DEFAULT_WIDTH;
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
  const layouted = await elk.layout(elkGraph);
  const nodes: Record<string, PositionedNode> = {};
  const edges: PositionedEdge[] = [];
  for (const child of layouted.children || []) {
    nodes[child.id] = {
      id: child.id,
      x: child.x || 0,
      y: child.y || 0,
      width: child.width || DEFAULT_WIDTH,
      height: child.height || DEFAULT_HEIGHT,
    };
  }
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
