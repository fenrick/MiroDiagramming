import { loadGraph, createNode, createEdges, GraphData } from './graph';
import { layoutGraph } from './elk-layout';
import type {
  BaseItem,
  Group,
  Connector,
  SnapToValues,
} from '@mirohq/websdk-types';

/**
 * High level orchestrator that loads graph data, runs layout and
 * creates all widgets on the board.
 */
export class GraphProcessor {
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
      const widget = await createNode(node, pos);
      nodeMap[node.id] = widget;
    }
    // Derive connector orientation hints from ELK edge routes
    const edgeHints = layout.edges.map((e, i) => {
      const src = layout.nodes[graph.edges[i].from];
      const tgt = layout.nodes[graph.edges[i].to];

      const orient = (
        node: typeof src,
        pt: { x: number; y: number }
      ): SnapToValues => {
        const cx = node.x + node.width / 2;
        const cy = node.y + node.height / 2;
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        if (Math.abs(dx) > Math.abs(dy)) {
          return dx < 0 ? 'left' : 'right';
        }
        return dy < 0 ? 'top' : 'bottom';
      };

      return {
        startSnap: orient(src, e.startPoint),
        endSnap: orient(tgt, e.endPoint),
      };
    });

    const connectors = await createEdges(graph.edges, nodeMap, edgeHints);
    await this.syncAll([...Object.values(nodeMap), ...connectors]);
  }

  /** Ensure the graph object has the expected shape. */
  private validateGraph(graph: GraphData): void {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph');
    }
  }

  /**
   * Call `.sync()` on each widget if the method exists.
   */
  private async syncAll(
    items: Array<BaseItem | Group | Connector>
  ): Promise<void> {
    for (const item of items) {
      if (typeof (item as any).sync === 'function') {
        await (item as any).sync();
      }
    }
  }
}
