import { loadGraph, defaultBuilder, GraphData } from './graph';
import { BoardBuilder } from './BoardBuilder';
import { layoutGraph } from './elk-layout';
import type { BaseItem, Group } from '@mirohq/websdk-types';

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

    // Calculate bounding box of the layout
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
    const margin = 40;
    const frameWidth = maxX - minX + margin * 2;
    const frameHeight = maxY - minY + margin * 2;
    const spot = await this.builder.findSpace(frameWidth, frameHeight);

    if (options.createFrame) {
      await this.builder.createFrame(
        frameWidth,
        frameHeight,
        spot.x,
        spot.y,
        options.frameTitle
      );
    } else {
      this.builder.setFrame(undefined);
    }

    const offsetX = spot.x - frameWidth / 2 + margin - minX;
    const offsetY = spot.y - frameHeight / 2 + margin - minY;

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
    // Derive connector orientation hints from ELK edge routes
    const edgeHints = layout.edges.map((e, i) => {
      const src = layout.nodes[graph.edges[i].from];
      const tgt = layout.nodes[graph.edges[i].to];

      const orient = (
        node: typeof src,
        pt: { x: number; y: number }
      ): { x: number; y: number } => {
        const px = (pt.x - node.x) / node.width;
        const py = (pt.y - node.y) / node.height;
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
    await this.builder.zoomTo({
      x: spot.x,
      y: spot.y,
      width: frameWidth,
      height: frameHeight,
    });
  }

  /** Ensure the graph object has the expected shape. */
  private validateGraph(graph: GraphData): void {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph');
    }
  }
}
