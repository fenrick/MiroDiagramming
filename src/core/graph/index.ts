import type { BaseItem, Group, Connector } from '@mirohq/websdk-types';
import { BoardBuilder } from '../../board/board-builder';
import { fileUtils } from '../utils/file-utils';

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

export class GraphService {
  private static instance: GraphService;
  private builder = new BoardBuilder();

  private constructor() {}

  /** Access the shared service instance. */
  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  /** Retrieve the default board builder. */
  public getBuilder(): BoardBuilder {
    return this.builder;
  }

  /** Load and parse JSON graph data from a file. */
  public async loadGraph(file: File): Promise<GraphData> {
    fileUtils.validateFile(file);
    const text = await fileUtils.readFileAsText(file);
    const data = JSON.parse(text) as unknown;
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray((data as { nodes?: unknown; edges?: unknown }).nodes) ||
      !Array.isArray((data as { nodes?: unknown; edges?: unknown }).edges)
    ) {
      throw new Error('Invalid graph data');
    }
    this.resetBoardCache();
    return data as GraphData;
  }

  /** Clear caches for board lookups. */
  public resetBoardCache(): void {
    this.builder.reset();
  }

  /** Search for a node by type and label. */
  public findNode(
    type: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    return this.builder.findNode(type, label);
  }

  /** Create or update a node widget. */
  public createNode(
    node: NodeData,
    pos: PositionedNode,
  ): Promise<BaseItem | Group> {
    return this.builder.createNode(node, pos);
  }

  /** Create or update connectors. */
  public createEdges(
    edges: EdgeData[],
    nodeMap: Record<string, BaseItem | Group>,
    hints?: EdgeHint[],
  ): Promise<Connector[]> {
    return this.builder.createEdges(edges, nodeMap, hints);
  }

  /** Proxy sync calls to widgets. */
  public syncAll(items: Array<BaseItem | Group | Connector>): Promise<void> {
    return this.builder.syncAll(items);
  }
}

export const graphService = GraphService.getInstance();
export const defaultBuilder = graphService.getBuilder();
