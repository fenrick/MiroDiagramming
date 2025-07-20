import type { ElkNode } from 'elkjs/lib/elk-api';
import { templateManager } from '../../board/templates';
import { GraphData } from '../graph';
import { aspectRatioValue } from '../utils/aspect-ratio';
import { loadElk } from './elk-loader';
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

/**
 * Determine the rendered dimensions for a graph node.
 *
 * @param node - Node data including optional metadata.
 * @returns Calculated width and height values.
 */
function resolveDimension(
  metaValue: number | undefined,
  templateValue: number | undefined,
  defaultValue: number,
): number {
  if (typeof metaValue === 'number') return metaValue;
  if (typeof templateValue === 'number') return templateValue;
  return defaultValue;
}

export function getNodeDimensions(node: {
  type: string;
  metadata?: { width?: number; height?: number };
}): { width: number; height: number } {
  const tpl = templateManager.getTemplate(node.type);
  const dims = tpl?.elements.find(e => e.width && e.height);
  const width = resolveDimension(
    node.metadata?.width,
    dims?.width,
    DEFAULT_WIDTH,
  );
  const height = resolveDimension(
    node.metadata?.height,
    dims?.height,
    DEFAULT_HEIGHT,
  );
  return { width, height };
}

/**
 * Convert validated layout options into ELK graph options.
 *
 * @param opts - Normalised layout options.
 * @returns ELK configuration for {@link performLayout}.
 */
export function buildElkGraphOptions(
  opts: UserLayoutOptions,
): Record<string, string> {
  return {
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.algorithm': opts.algorithm,
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    'elk.layered.mergeEdges': 'false',
    'elk.direction': opts.direction,
    'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.spacing),
    'elk.spacing.nodeNode': String(opts.spacing),
    'elk.layered.unnecessaryBendpoints': 'true',
    'elk.layered.cycleBreaking.strategy': 'GREEDY',
    ...(opts.aspectRatio && {
      'elk.aspectRatio': String(aspectRatioValue(opts.aspectRatio)),
    }),
    ...(opts.edgeRouting && { 'elk.edgeRouting': opts.edgeRouting }),
    ...(opts.edgeRoutingMode && {
      'elk.mrtree.edgeRoutingMode': opts.edgeRoutingMode,
    }),
    ...(opts.optimizationGoal && {
      'elk.rectpacking.widthApproximation.optimizationGoal':
        opts.optimizationGoal,
    }),
  };
}

export interface LayoutResult {
  nodes: Record<string, PositionedNode>;
  edges: PositionedEdge[];
}

/**
 * Run the ELK layout engine on the provided graph data.
 *
 * @param data - The graph to layout.
 * @param opts - Optional layout configuration overrides.
 * @returns The positioned nodes and edges produced by ELK.
 */
export async function performLayout(
  data: GraphData,
  opts: Partial<UserLayoutOptions> = {},
): Promise<LayoutResult> {
  const Elk = await loadElk();
  const elk = new Elk();
  const userOpts = validateLayoutOptions(opts);

  const elkGraph = buildElkGraph(data, userOpts);
  const layouted = await elk.layout(elkGraph);

  const nodes = mapNodes(layouted.children);
  const edges = mapEdges(layouted.edges);

  return { nodes, edges };
}

/**
 * Convert graph data into ELK's expected structure.
 */
function buildElkGraph(data: GraphData, opts: UserLayoutOptions): ElkNode {
  return {
    id: 'root',
    layoutOptions: buildElkGraphOptions(opts),
    children: data.nodes.map(n => ({ id: n.id, ...getNodeDimensions(n) })),
    edges: data.edges.map((e, idx) => ({
      id: `e${idx}`,
      sources: [e.from],
      targets: [e.to],
    })),
  };
}

/**
 * Map ELK positioned children back into our node structure.
 */
function mapNodes(
  children: ElkNode['children'],
): Record<string, PositionedNode> {
  const nodes: Record<string, PositionedNode> = {};
  for (const child of children ?? []) {
    nodes[child.id] = {
      id: child.id,
      x: child.x ?? 0,
      y: child.y ?? 0,
      width: child.width ?? DEFAULT_WIDTH,
      height: child.height ?? DEFAULT_HEIGHT,
    };
  }
  return nodes;
}

/**
 * Map ELK positioned edges back into our edge structure.
 */
function mapEdges(edges: ElkNode['edges']): PositionedEdge[] {
  const result: PositionedEdge[] = [];
  for (const edge of edges ?? []) {
    const section = edge.sections?.[0];
    if (!section) continue;
    result.push({
      startPoint: section.startPoint,
      endPoint: section.endPoint,
      bendPoints: section.bendPoints,
    });
  }
  return result;
}
