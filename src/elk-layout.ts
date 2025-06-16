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
    layoutOptions: { 'elk.algorithm': 'layered' },
    children: data.nodes.map((n) => ({
      id: n.id,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    })),
    edges: data.edges.map((e, idx) => ({
      id: `e${idx}`,
      sources: [e.source],
      targets: [e.target],
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
