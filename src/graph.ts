import { createFromTemplate } from './templates';
import type { BaseItem, Group, Connector, Item } from '@mirohq/websdk-types';

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

interface NodeMetadata {
  type: string;
  label: string;
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
): Promise<Item | undefined> {
  const shapes = await miro.board.get({ type: 'shape' });
  for (const item of shapes as BaseItem[]) {
    const meta = (await item.getMetadata('app.miro.structgraph')) as unknown as
      | NodeMetadata
      | undefined;
    if (meta?.type === type && meta.label === label) {
      return item as Item;
    }
  }

  const groups = (await miro.board.get({ type: 'group' })) as Group[];
  for (const group of groups) {
    const items = await group.getItems();
    for (const item of items) {
      const meta = (await item.getMetadata(
        'app.miro.structgraph'
      )) as unknown as NodeMetadata | undefined;
      if (meta?.type === type && meta.label === label) {
        return group as Item;
      }
    }
  }

  return undefined;
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
): Promise<BaseItem | Group> {
  const existing = await findNode(node.type, node.label);
  if (existing) {
    return existing as BaseItem | Group;
  }
  const widget = (await createFromTemplate(
    node.type,
    node.label,
    pos.x,
    pos.y
  )) as BaseItem | Group;

  if ((widget as Group).type === 'group') {
    const items = await (widget as Group).getItems();
    for (const item of items) {
      await item.setMetadata('app.miro.structgraph', {
        type: node.type,
        label: node.label,
      });
      await item.sync();
    }
    return widget as Group;
  }

  await (widget as BaseItem).setMetadata('app.miro.structgraph', {
    type: node.type,
    label: node.label,
  });
  await (widget as BaseItem).sync();
  return widget as BaseItem;
}

/** Create connectors with labels and metadata. */
export async function createEdges(
  edges: EdgeData[],
  nodeMap: Record<string, BaseItem | Group>
): Promise<Connector[]> {
  const connectors: Connector[] = [];
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
