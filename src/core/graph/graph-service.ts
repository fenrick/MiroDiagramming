import type { BaseItem, Connector, Group } from '@mirohq/websdk-types'

import { BoardBuilder } from '../../board/board-builder'
import type { HierNode } from '../layout/nested-layout'
import { fileUtils as fileUtilities } from '../utils/file-utils'

export interface NodeData {
  id: string
  label: string
  type: string
  metadata?: Record<string, unknown>
}

export interface EdgeData {
  from: string
  to: string
  label?: string
  metadata?: Record<string, unknown>
}

export interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}

export interface PositionedNode {
  x: number
  y: number
  width: number
  height: number
}

export interface EdgeHint {
  startPosition?: { x: number; y: number }
  endPosition?: { x: number; y: number }
}

export class GraphService {
  private static instance: GraphService
  private readonly builder = new BoardBuilder()

  private constructor() {}

  /** Access the shared service instance. */
  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService()
    }
    return GraphService.instance
  }

  /** Retrieve the default board builder. */
  public getBuilder(): BoardBuilder {
    return this.builder
  }

  /** Load and parse JSON graph data from a file. */
  public async loadGraph(file: File): Promise<GraphData> {
    fileUtilities.validateFile(file)
    const text = await fileUtilities.readFileAsText(file)
    const data = JSON.parse(text) as unknown
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray((data as { nodes?: unknown; edges?: unknown }).nodes) ||
      !Array.isArray((data as { nodes?: unknown; edges?: unknown }).edges)
    ) {
      throw new Error('Invalid graph data')
    }
    this.resetBoardCache()
    return data as GraphData
  }

  /**
   * Load graph data which may be hierarchical or flat.
   *
   * @param file File containing either a {@link GraphData} object or a
   *   hierarchy array. The board cache is always reset before returning.
   * @returns Parsed graph structure suitable for {@link GraphProcessor}.
   * @throws {Error} If the JSON structure is not recognised.
   */
  public async loadAnyGraph(file: File): Promise<GraphData | HierNode[]> {
    fileUtilities.validateFile(file)
    const text = await fileUtilities.readFileAsText(file)
    const data = JSON.parse(text) as unknown
    const isObject = data !== null && typeof data === 'object'
    const hasNodes = isObject && Array.isArray((data as { nodes?: unknown }).nodes)
    const hasEdges = isObject && Array.isArray((data as { edges?: unknown }).edges)
    if (isObject && hasNodes && hasEdges) {
      this.resetBoardCache()
      return data as GraphData
    }
    if (Array.isArray(data)) {
      this.resetBoardCache()
      return data as HierNode[]
    }
    throw new Error('Invalid graph data')
  }

  /** Clear caches for board lookups. */
  public resetBoardCache(): void {
    this.builder.reset()
  }

  /** Search for a node by type and label. */
  public findNode(type: string, label: string): Promise<BaseItem | Group | undefined> {
    return this.builder.findNode(type, label)
  }

  /** Create or update a node widget. */
  public createNode(node: NodeData, pos: PositionedNode): Promise<BaseItem | Group> {
    return this.builder.createNode(node, pos)
  }

  /** Create or update connectors. */
  public createEdges(
    edges: EdgeData[],
    nodeMap: Record<string, BaseItem | Group>,
    hints?: EdgeHint[],
  ): Promise<Connector[]> {
    return this.builder.createEdges(edges, nodeMap, hints)
  }

  /** Proxy sync calls to widgets. */
  public syncAll(items: Array<BaseItem | Group | Connector>): Promise<void> {
    return this.builder.syncAll(items)
  }
}

export const graphService = GraphService.getInstance()
export const defaultBuilder = graphService.getBuilder()
