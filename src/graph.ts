import { createFromTemplate, getConnectorTemplate } from './templates';
import type {
  BaseItem,
  Group,
  Connector,
  Item,
  SnapToValues,
} from '@mirohq/websdk-types';

// Simple in-memory caches to avoid repeated board lookups while processing
let shapeCache: BaseItem[] | undefined;
// Cache connectors to avoid repeated board searches during processing
let connectorCache: Connector[] | undefined;

/** Clear all board caches. Useful between runs or during tests. */
export function resetBoardCache(): void {
  shapeCache = undefined;
  connectorCache = undefined;
}

export interface NodeData {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface EdgeData {
  from: string;
  to: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface NodeMetadata {
  type: string;
  label: string;
}

interface EdgeMetadata {
  from: string;
  to: string;
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
  if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
    throw new Error('Invalid file');
  }
  const text = await readFile(file);
  const data = JSON.parse(text) as unknown;
  if (
    !data ||
    !Array.isArray((data as any).nodes) ||
    !Array.isArray((data as any).edges)
  ) {
    throw new Error('Invalid graph data');
  }
  resetBoardCache();
  return data as GraphData;
}

/** Search the board for an existing widget with matching metadata. */
export async function findNode(
  type: string,
  label: string
): Promise<Item | undefined> {
  if (typeof type !== 'string' || typeof label !== 'string') {
    throw new Error('Invalid search parameters');
  }
  if (!(globalThis as any).miro?.board) {
    throw new Error('Miro board not initialized');
  }
  if (!shapeCache) {
    shapeCache = (await miro.board.get({ type: 'shape' })) as BaseItem[];
  }
  for (const item of shapeCache) {
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
    if (!Array.isArray(items)) continue;
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

/** Search the board for an existing connector with matching metadata. */
export async function findConnector(
  from: string,
  to: string
): Promise<Connector | undefined> {
  if (typeof from !== 'string' || typeof to !== 'string') {
    throw new Error('Invalid search parameters');
  }
  if (!(globalThis as any).miro?.board) {
    throw new Error('Miro board not initialized');
  }
  if (!connectorCache) {
    connectorCache = (await miro.board.get({ type: 'connector' })) as Connector[];
  }
  for (const conn of connectorCache) {
    const meta = (await conn.getMetadata(
      'app.miro.structgraph'
    )) as unknown as EdgeMetadata | undefined;
    if (meta?.from === from && meta.to === to) {
      return conn as Connector;
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
  if (!node || typeof node !== 'object') {
    throw new Error('Invalid node');
  }
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
    throw new Error('Invalid position');
  }
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
    }
    // Groups aren't cached to avoid stale data
    return widget as Group;
  }

  await (widget as BaseItem).setMetadata('app.miro.structgraph', {
    type: node.type,
    label: node.label,
  });
  if (shapeCache) {
    shapeCache.push(widget as BaseItem);
  }
  return widget as BaseItem;
}

/** Optional hints describing how a connector should attach to nodes. */
export interface EdgeHint {
  startSnap?: SnapToValues;
  endSnap?: SnapToValues;
}

/** Create connectors with labels, metadata and optional snap hints. */
export async function createEdges(
  edges: EdgeData[],
  nodeMap: Record<string, BaseItem | Group>,
  hints?: EdgeHint[]
): Promise<Connector[]> {
  if (!Array.isArray(edges)) {
    throw new Error('Invalid edges');
  }
  if (!nodeMap || typeof nodeMap !== 'object') {
    throw new Error('Invalid node map');
  }
  const connectors: Connector[] = [];
  // Iterate edges in the same order as the ELK layout to align hints
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const from = nodeMap[edge.from];
    const to = nodeMap[edge.to];
    if (!from || !to) continue;
    const existing = await findConnector(edge.from, edge.to);
    if (existing) {
      connectors.push(existing);
      continue;
    }
    // Apply styling from connector templates when present
    const style = getConnectorTemplate(
      (edge.metadata as any)?.template || 'default'
    )?.style;
    // Snap connectors to the sides indicated by the ELK layout
    const hint = hints?.[i];
    const connector = await miro.board.createConnector({
      start: { item: from.id, snapTo: hint?.startSnap },
      end: { item: to.id, snapTo: hint?.endSnap },
      captions: edge.label ? [{ content: edge.label }] : undefined,
      style: style as any,
    });
    connector.setMetadata('app.miro.structgraph', {
      from: edge.from,
      to: edge.to,
    });
    if (connectorCache) {
      connectorCache.push(connector);
    }
    connectors.push(connector);
  }
  return connectors;
}
