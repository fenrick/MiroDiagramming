import { createFromTemplate } from './templates';

export interface NodeData {
  id: string;
  label: string;
  type: string;
}

export interface EdgeData {
  from: string;
  to: string;
  label?: string;
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

export async function loadGraph(file: File): Promise<GraphData> {
  const text = await readFile(file);
  return JSON.parse(text) as GraphData;
}

/** Search the board for an existing widget with matching metadata. */
export async function findNode(
  type: string,
  label: string
): Promise<any | undefined> {
  const items = await miro.board.get({
    metadata: { 'app.miro.structgraph': { type, label } },
  });
  return items[0];
}

export interface PositionedNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Create or reuse a node widget from a template. */
export async function createNode(
  node: NodeData,
  pos: PositionedNode
): Promise<any> {
  const existing = await findNode(node.type, node.label);
  if (existing) {
    return existing;
  }
  const widget = await createFromTemplate(node.type, node.label, pos.x, pos.y);
  widget.setMetadata('app.miro.structgraph', {
    type: node.type,
    label: node.label,
  });
  await widget.sync();
  return widget;
}

/** Create connectors with labels and metadata. */
export async function createEdges(
  edges: EdgeData[],
  nodeMap: Record<string, any>
): Promise<any[]> {
  const connectors: any[] = [];
  for (const edge of edges) {
    const from = nodeMap[edge.from];
    const to = nodeMap[edge.to];
    if (!from || !to) continue;
    const connector = await miro.board.createConnector({
      start: { item: from.id },
      end: { item: to.id },
      captions: edge.label ? [{ content: edge.label }] : undefined,
    });
    connector.setMetadata('app.miro.structgraph', {
      from: edge.from,
      to: edge.to,
    });
    await connector.sync();
    connectors.push(connector);
  }
  return connectors;
}
