import { loadGraph, createNode, createEdges, GraphData } from './graph';
import { layoutGraph } from './elk-layout';
import type { BaseItem, Group, Connector } from '@mirohq/websdk-types';

export class GraphProcessor {
  public async processFile(file: File): Promise<void> {
    if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
      throw new Error('Invalid file');
    }
    const graph = await loadGraph(file);
    await this.processGraph(graph);
  }

  public async processGraph(graph: GraphData): Promise<void> {
    this.validateGraph(graph);
    const positions = await layoutGraph(graph);
    const nodeMap: Record<string, BaseItem | Group> = {};
    for (const node of graph.nodes) {
      const pos = positions[node.id];
      const widget = await createNode(node, pos);
      nodeMap[node.id] = widget;
    }
    const connectors = await createEdges(graph.edges, nodeMap);
    await this.syncAll([...Object.values(nodeMap), ...connectors]);
  }

  private validateGraph(graph: GraphData): void {
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph');
    }
  }

  private async syncAll(items: Array<BaseItem | Group | Connector>): Promise<void> {
    for (const item of items) {
      if (typeof (item as any).sync === 'function') {
        await (item as any).sync();
      }
    }
  }
}
