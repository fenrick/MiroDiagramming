export interface NodeData {
  id: string;
  label: string;
  type?: string;
}

export interface EdgeData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        reject('Failed to load file');
        return;
      }
      resolve(e.target.result as string);
    };
    reader.onerror = () => reject('Failed to load file');
    reader.readAsText(file, 'utf-8');
  });

export const loadGraph = async (file: File): Promise<GraphData> => {
  const text = await readFile(file);
  return JSON.parse(text) as GraphData;
};

import { getTemplate, ShapeTemplate } from './templates';
import { ShapeType, type Shape } from '@mirohq/websdk-types';

export interface GraphNode {
  template: string;
  children?: GraphNode[];
}

async function createShapeFromTemplate(
  template: ShapeTemplate,
  x: number,
  y: number
) {
  return miro.board.createShape({
    content: template.name,
    x,
    y,
    shape: template.shape as any,
    width: template.width,
    height: template.height,
    style: {
      fillColor: template.fillColor,
      color: template.color,
    },
  });
}

async function renderNode(node: GraphNode, x: number, y: number) {
  const tmpl = getTemplate(node.template);
  if (!tmpl) {
    throw new Error(`Template ${node.template} not found`);
  }

  const shape = await createShapeFromTemplate(tmpl, x, y);
  let items = [shape];

  if (node.children && node.children.length) {
    let offsetY = y + tmpl.height + 40;
    for (const child of node.children) {
      const childItems = await renderNode(child, x + tmpl.width + 40, offsetY);
      items.push(...childItems);
      offsetY += tmpl.height + 40;
    }
  }

  return items;
}

export async function renderGraph(root: GraphNode, x: number, y: number) {
  const items = await renderNode(root, x, y);
  if (items.length > 1) {
    await miro.board.group({ items });
  }
}
export interface PositionedNode {
  id: string;
  widget: { id: string };
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
  label?: string;
}

export interface Graph {
  id: string;
  nodes: PositionedNode[];
  edges: GraphEdge[];
}

/**
 * Draw connectors between positioned nodes on the board.
 *
 * @param graph - Graph containing edges to create.
 * @param nodeMap - Map of node ids to widget instances returned from createNodes.
 * @returns Array of created connector widgets.
 */
export async function createEdges(
  graph: Graph,
  nodeMap: Record<string, { id: string }>
): Promise<import('@mirohq/websdk-types').Connector[]> {
  const connectors: import('@mirohq/websdk-types').Connector[] = [];
  for (const edge of graph.edges) {
    const fromWidget = nodeMap[edge.from];
    const toWidget = nodeMap[edge.to];
    if (!fromWidget || !toWidget) continue;
    const connector = await miro.board.createConnector({
      start: { item: fromWidget.id },
      end: { item: toWidget.id },
      captions: [{ content: edge.label }],
    });
    connector.setMetadata('app.miro.structgraph', {
      graphId: graph.id,
      from: edge.from,
      to: edge.to,
    });
    await connector.sync();
    connectors.push(connector);
  }
  return connectors;
}

export async function getShapeByMetadata(
  type: string,
  label: string
): Promise<Shape | undefined> {
  const items = await miro.board.get({
    type: 'shape',
    metadata: { type, label },
  });

  return (items[0] as Shape) ?? undefined;
}

export interface CreateNodeOptions {
  type: string;
  label: string;
  x?: number;
  y?: number;
  shape?: ShapeType;
  fillColor?: string;
  color?: string;
  width?: number;
  height?: number;
}

export async function createNode(options: CreateNodeOptions): Promise<Shape> {
  const existing = await getShapeByMetadata(options.type, options.label);
  if (existing) return existing;

  const shape = await miro.board.createShape({
    content: options.label,
    x: options.x ?? 0,
    y: options.y ?? 0,
    shape: options.shape ?? ShapeType.RoundRectangle,
    style: {
      fillColor: options.fillColor ?? '#ffffff',
      color: options.color ?? '#000000',
    },
    width: options.width,
    height: options.height,
  });

  shape.setMetadata('nodeType', options.type);
  shape.setMetadata('nodeLabel', options.label);
  await shape.sync();

  return shape as Shape;
}
