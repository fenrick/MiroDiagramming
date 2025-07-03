import { GraphData, graphService } from './graph-service';
import { edgesToHierarchy, hierarchyToEdges } from './convert';
import { isNestedAlgorithm } from './layout-modes';
import { HierarchyProcessor } from './hierarchy-processor';
import type { HierNode } from '../layout/nested-layout';
import { BoardBuilder } from '../../board/board-builder';
import { clearActiveFrame, registerFrame } from '../../board/frame-utils';
import { UndoableProcessor } from './undoable-processor';
import { layoutEngine, LayoutResult } from '../layout/elk-layout';
import { UserLayoutOptions } from '../layout/elk-options';
import { fileUtils } from '../utils/file-utils';
import {
  computeEdgeHints,
  boundingBoxFromTopLeft,
  frameOffset,
} from '../layout/layout-utils';
import type { BaseItem, Frame, Group } from '@mirohq/websdk-types';

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
  /** Optional custom layout options. */
  layout?: Partial<UserLayoutOptions>;
}

export class GraphProcessor extends UndoableProcessor {
  /** Map of processed node IDs to created widget IDs. */
  private nodeIdMap: Record<string, string> = {};
  constructor(builder: BoardBuilder = graphService.getBuilder()) {
    super(builder);
  }

  /** Mapping from node ID to created widget ID for the last run. */
  public getNodeIdMap(): Record<string, string> {
    return { ...this.nodeIdMap };
  }

  /**
   * Load a JSON graph file and process it.
   */
  public async processFile(
    file: File,
    options: ProcessOptions = {},
  ): Promise<void> {
    fileUtils.validateFile(file);
    const data = await graphService.loadAnyGraph(file);
    await this.processGraph(data, options);
  }

  /**
   * Given parsed graph data, create all nodes and connectors on the board.
   */
  public async processGraph(
    graph: GraphData | HierNode[],
    options: ProcessOptions = {},
  ): Promise<void> {
    this.nodeIdMap = {};
    const alg = options.layout?.algorithm ?? 'mrtree';
    if (isNestedAlgorithm(alg)) {
      const hp = new HierarchyProcessor(this.builder);
      const hierarchy = Array.isArray(graph) ? graph : edgesToHierarchy(graph);
      await hp.processHierarchy(hierarchy, {
        createFrame: options.createFrame,
        frameTitle: options.frameTitle,
      });
      this.lastCreated = hp.getLastCreated();
      return;
    }
    const data = Array.isArray(graph) ? hierarchyToEdges(graph) : graph;
    this.validateGraph(data);
    const layout = await layoutEngine.layoutGraph(data, options.layout);

    const bounds = this.layoutBounds(layout);
    const margin = 100;
    const frameWidth = bounds.maxX - bounds.minX + margin * 2;
    const frameHeight = bounds.maxY - bounds.minY + margin * 2;
    const spot = await this.builder.findSpace(frameWidth, frameHeight);

    let frame: Frame | undefined;
    if (options.createFrame !== false) {
      frame = await registerFrame(
        this.builder,
        this.lastCreated,
        frameWidth,
        frameHeight,
        spot,
        options.frameTitle,
      );
    } else {
      clearActiveFrame(this.builder);
    }

    const { offsetX, offsetY } = this.calculateOffset(
      spot,
      frameWidth,
      frameHeight,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    );

    const nodeMap = await this.createNodes(data, layout, offsetX, offsetY);
    // Widgets are created without syncing so we can validate edges first.
    await this.createConnectorsAndZoom(data, layout, nodeMap, frame);
  }

  // undoLast inherited from UndoableProcessor

  /**
   * Determine the bounding box for positioned nodes.
   */
  private layoutBounds(layout: LayoutResult) {
    return boundingBoxFromTopLeft(layout.nodes);
  }

  /**
   * Calculate offsets for node placement within the board.
   */
  private calculateOffset(
    spot: { x: number; y: number },
    frameWidth: number,
    frameHeight: number,
    bounds: { minX: number; minY: number },
    margin: number,
  ) {
    return frameOffset(spot, frameWidth, frameHeight, bounds, margin);
  }

  /**
   * Create nodes for the provided graph using the layout offsets.
   */
  private async createNodes(
    graph: GraphData,
    layout: LayoutResult,
    offsetX: number,
    offsetY: number,
  ): Promise<Record<string, BaseItem | Group>> {
    const nodeMap: Record<string, BaseItem | Group> = {};
    for (const node of graph.nodes) {
      const pos = layout.nodes[node.id];
      const adjPos = { ...pos, x: pos.x + offsetX, y: pos.y + offsetY };
      const widget = await this.builder.createNode(node, adjPos);
      nodeMap[node.id] = widget;
      this.nodeIdMap[node.id] = widget.id;
      this.registerCreated(widget);
    }
    return nodeMap;
  }

  /**
   * Connect nodes and zoom the board to the created content.
   */
  private async createConnectorsAndZoom(
    graph: GraphData,
    layout: LayoutResult,
    nodeMap: Record<string, BaseItem | Group>,
    frame?: Frame,
  ): Promise<void> {
    const edgeHints = computeEdgeHints(graph, layout);
    const connectors = await this.builder.createEdges(
      graph.edges,
      nodeMap,
      edgeHints,
    );
    this.registerCreated(connectors);
    await this.syncOrUndo([...Object.values(nodeMap), ...connectors]);
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
