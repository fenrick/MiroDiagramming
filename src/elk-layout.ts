import ELK from 'elkjs/lib/elk.bundled.js';
import { GraphData } from './graph';

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 110;

export const layoutGraph = async (
  data: GraphData
): Promise<Record<string, PositionedNode>> => {
  const elk = new ELK();
  const elkGraph: any = {
    id: 'root',
    layoutOptions: {
      'elk.hierachyHandling': 'INCLUDE_CHILDREN', 'elk.algorithm': 'mrtree',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.mergeEdges': 'false',
      'elk.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.spacing.nodeNode': 90,
      'elk.layered.unnnecessaryBendpoints': 'true',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.nodeSize.minimum': `${DEFAULT_WIDTH},${DEFAULT_HEIGHT}`,
    },
    children: data.nodes.map((n) => ({
      id: n.id,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    })),
    edges: data.edges.map((e, idx) => ({
      id: `e${idx}`,
      sources: [e.from],
      targets: [e.to],
    })),
  };

  const layouted: any = await elk.layout(elkGraph);
  const result: Record<string, PositionedNode> = {};
  for (const child of layouted.children || []) {
    result[child.id] = {
      id: child.id,
      x: child.x || 0,
      y: child.y || 0,
      width: child.width || DEFAULT_WIDTH,
      height: child.height || DEFAULT_HEIGHT,
    };
  }
  return result;
};
