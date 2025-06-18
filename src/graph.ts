import type { BaseItem, Group, Connector } from '@mirohq/websdk-types';
import { BoardBuilder } from './BoardBuilder';
import { readFileAsText, validateFile } from './file-utils';

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

export interface PositionedNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeHint {
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
}

/** Load and parse JSON graph data from a file. */
export async function loadGraph(file: File): Promise<GraphData> {
  validateFile(file);
  const text = await readFileAsText(file);
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

// Default builder instance used by wrapper helper functions
export const defaultBuilder = new BoardBuilder();

/** Clear caches for board lookups. */
export function resetBoardCache(): void {
  defaultBuilder.reset();
}

/** Wrapper to search for an existing node. */
export const findNode = (
  type: string,
  label: string
): Promise<BaseItem | Group | undefined> =>
  defaultBuilder.findNode(type, label);

/** Wrapper to search for an existing connector. */
export const findConnector = (
  from: string,
  to: string
): Promise<Connector | undefined> => defaultBuilder.findConnector(from, to);

/** Wrapper to create or update a node widget. */
export const createNode = (
  node: NodeData,
  pos: PositionedNode
): Promise<BaseItem | Group> => defaultBuilder.createNode(node, pos);

/** Wrapper to create or update connectors. */
export const createEdges = (
  edges: EdgeData[],
  nodeMap: Record<string, BaseItem | Group>,
  hints?: EdgeHint[]
): Promise<Connector[]> => defaultBuilder.createEdges(edges, nodeMap, hints);

/** Proxy to sync multiple widgets. */
export const syncAll = (
  items: Array<BaseItem | Group | Connector>
): Promise<void> => defaultBuilder.syncAll(items);
