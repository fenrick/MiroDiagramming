import { loadGraph, defaultBuilder, GraphData } from './graph';
import { BoardBuilder } from './BoardBuilder';
import { layoutGraph, LayoutResult } from './elk-layout';
import type { BaseItem, Group, Frame } from '@mirohq/websdk-types';

/**
 * High level orchestrator that loads graph data, runs layout and
 * creates all widgets on the board.
 */
/** Options controlling how the graph is rendered on the board. */
export interface ProcessOptions {
  /** Whether to wrap the diagram in a frame. */
  createFrame?: boolean;
  /** Optional title for the created frame. */
  frameTitle?: string;
}

export class GraphProcessor {
  constructor(private builder: BoardBuilder = defaultBuilder) {}

  /**
   * Determine the bounding box for positioned nodes.
   */
  private layoutBounds(layout: LayoutResult): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    Object.values(layout.nodes).forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });
    return { minX, minY, maxX, maxY };
  }

  /**
   * Calculate offsets for node placement within the board.
   */
  private calculateOffset(
    spot: { x: number; y: number },
    frameWidth: number,
    frameHeight: number,
    bounds: { minX: number; minY: number },
    margin: number
  ): { offsetX: number; offsetY: number } {
    return {
      offsetX: spot.x - frameWidth / 2 + margin - bounds.minX,
      offsetY: spot.y - frameHeight / 2 + margin - bounds.minY,
    };
  }
  /**
   * Load a JSON graph file and process it.
   */
  public async processFile(
    file: File,
    options: ProcessOptions = {}
  ): Promise<void> {
    if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
      throw new Error('Invalid file');
    }
    const graph = await loadGraph(file);
    await this.processGraph(graph, options);
  }

  /**
   * Given parsed graph data, create all nodes and connectors on the board.
   */
  public async processGraph(
    graph: GraphData,
    options: ProcessOptions = {}
  ): Promise<void> {
    this.validateGraph(graph);
    const layout = await layoutGraph(graph);

    const bounds = this.layoutBounds(layout);
    const margin = 100;
    const frameWidth = bounds.maxX - bounds.minX + margin * 2;
    const frameHeight = bounds.maxY - bounds.minY + margin * 2;
    const spot = await this.builder.findSpace(frameWidth, frameHeight);

    const useFrame = options.createFrame !== false;
    let frame: Frame | undefined;
    if (useFrame) {
      frame = await this.builder.createFrame(
        frameWidth,
        frameHeight,
        spot.x,
        spot.y,
        options.frameTitle
      );
    } else {
      this.builder.setFrame(undefined);
    }

    const { offsetX, offsetY } = this.calculateOffset(
      spot,
      frameWidth,
      frameHeight,
      { minX: bounds.minX, minY: bounds.minY },
      margin
    );

    const nodeMap: Record<string, BaseItem | Group> = {};
    for (const node of graph.nodes) {
      const pos = layout.nodes[node.id];
      const adjPos = {
        ...pos,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      };
      const widget = await this.builder.createNode(node, adjPos);
      nodeMap[node.id] = widget;
    }

    const adjustedEdges = layout.edges.map((edge) => ({
      startPoint: {
        x: edge.startPoint.x + offsetX,
        y: edge.startPoint.y + offsetY,
      },
      endPoint: {
        x: edge.endPoint.x + offsetX,
        y: edge.endPoint.y + offsetY,
      },
      bendPoints: edge.bendPoints?.map((pt) => ({
        x: pt.x + offsetX,
        y: pt.y + offsetY,
      })),
    }));
    // Derive connector orientation hints from ELK edge routes
    const edgeHints = adjustedEdges.map((e, i) => {
      const src = layout.nodes[graph.edges[i].from];
      const tgt = layout.nodes[graph.edges[i].to];

      const orient = (
        node: typeof src,
        pt: { x: number; y: number }
      ): { x: number; y: number } => {
        const px = (pt.x - (node.x + offsetX)) / node.width;
        const py = (pt.y - (node.y + offsetY)) / node.height;
        return { x: px, y: py };
      };

      return {
        startPosition: orient(src, e.startPoint),
        endPosition: orient(tgt, e.endPoint),
      };
    });

    const connectors = await this.builder.createEdges(
      graph.edges,
      nodeMap,
      edgeHints
    );
    await this.builder.syncAll([...Object.values(nodeMap), ...connectors]);
    if (frame) {
      await this.builder.zoomTo(frame);
    } else {
      await this.builder.zoomTo(Object.values(nodeMap));
    }
  }

  /**
   * Ensure the provided graph data is valid.
   *
   * @throws {Error} If the graph does not have the expected top level format or
   *   if any edge references a non-existent node. The thrown error message
   *   provides details about the specific problem.
   */
  private validateGraph(graph: GraphData): void {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph format');
    }

    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from)) {
        throw new Error(`Edge references missing node: ${edge.from}`);
      }
      if (!nodeIds.has(edge.to)) {
        throw new Error(`Edge references missing node: ${edge.to}`);
      }
    }
  }
}
