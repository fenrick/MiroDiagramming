import { loadGraph, defaultBuilder, GraphData } from './graph';
import { BoardBuilder } from './BoardBuilder';
import { layoutGraph } from './elk-layout';
import type { BaseItem, Group } from '@mirohq/websdk-types';

/**
 * High level orchestrator that loads graph data, runs layout and
 * creates all widgets on the board.
 */
export class GraphProcessor {
  constructor(private builder: BoardBuilder = defaultBuilder) {}
  /**
   * Load a JSON graph file and process it.
   */
  public async processFile(file: File): Promise<void> {
    if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
      throw new Error('Invalid file');
    }
    const graph = await loadGraph(file);
    await this.processGraph(graph);
  }

  /**
   * Given parsed graph data, create all nodes and connectors on the board.
   */
  public async processGraph(graph: GraphData): Promise<void> {
    this.validateGraph(graph);
    const layout = await layoutGraph(graph);
    const nodeMap: Record<string, BaseItem | Group> = {};
    for (const node of graph.nodes) {
      const pos = layout.nodes[node.id];
      const widget = await this.builder.createNode(node, pos);
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
  }

  /** Ensure the graph object has the expected shape. */
  private validateGraph(graph: GraphData): void {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph');
    }
  }
}
