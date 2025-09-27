import type { BaseItem, Frame, Group } from '@mirohq/websdk-types'

import { maybeSync } from '../../board/board'
import { BoardBuilder } from '../../board/board-builder'
import { clearActiveFrame, registerFrame } from '../../board/frame-utils'
import type { TemplateElement } from '../../board/templates'
import { layoutEngine, LayoutResult } from '../layout/elk-layout'
import { UserLayoutOptions } from '../layout/elk-options'
import type { PositionedNode } from '../layout/layout-core'
import { boundingBoxFromTopLeft, computeEdgeHints, frameOffset } from '../layout/layout-utils'
import type { HierNode } from '../layout/nested-layout'
import { fileUtils } from '../utils/file-utils'

import { edgesToHierarchy, hierarchyToEdges } from './convert'
import { GraphData, graphService } from './graph-service'
import type { NodeData } from './graph-service'
import { HierarchyProcessor } from './hierarchy-processor'
import { isNestedAlgorithm } from './layout-modes'
import { UndoableProcessor } from './undoable-processor'

/** Board widget or group item. */
type BoardItem = BaseItem | Group

type MermaidNodeMetadata = {
  styleOverrides?: {
    fillColor?: string
    borderColor?: string
    borderWidth?: number
    textColor?: string
  }
  shape?: string
}

/**
 * High level orchestrator that loads graph data, runs layout and
 * creates all widgets on the board.
 */
/**
 * Behaviour options for nodes already present on the board.
 *
 * - `move`: move widgets into the new layout positions.
 * - `layout`: keep widgets in selection and feed their coordinates to ELK.
 * - `ignore`: leave widgets in place and use their existing coordinates.
 */
export type ExistingNodeMode = 'move' | 'layout' | 'ignore'

export interface ProcessOptions {
  /** Whether to wrap the diagram in a frame. */
  createFrame?: boolean
  /** Optional title for the created frame. */
  frameTitle?: string
  /** Optional custom layout options. */
  layout?: Partial<UserLayoutOptions>
  /** How to treat nodes that already exist on the board. */
  existingMode?: ExistingNodeMode
}

export class GraphProcessor extends UndoableProcessor {
  /** Map of processed node IDs to created widget IDs. */
  private nodeIdMap: Record<string, string> = {}

  constructor(builder: BoardBuilder = graphService.getBuilder()) {
    super(builder)
  }

  /** Mapping from node ID to created widget ID for the last run. */
  public getNodeIdMap(): Record<string, string> {
    return { ...this.nodeIdMap }
  }

  /**
   * Load a JSON graph file and process it.
   */
  public async processFile(file: File, options: ProcessOptions = {}): Promise<void> {
    fileUtils.validateFile(file)
    const data = await graphService.loadAnyGraph(file)
    await this.processGraph(data, options)
  }

  /**
   * Given parsed graph data, create all nodes and connectors on the board.
   */
  public async processGraph(
    graph: GraphData | HierNode[],
    options: ProcessOptions = {},
  ): Promise<void> {
    this.nodeIdMap = {}
    const existingMode: ExistingNodeMode = options.existingMode ?? 'move'
    const alg = options.layout?.algorithm ?? 'mrtree'
    if (isNestedAlgorithm(alg)) {
      await this.processNestedGraph(graph, options)
      return
    }
    const data = Array.isArray(graph) ? hierarchyToEdges(graph) : graph
    this.validateGraph(data)
    const existing = await this.collectExistingNodes(data)
    const layoutInput = this.buildLayoutInput(data, existing, existingMode)
    const layout = await layoutEngine.layoutGraph(layoutInput, options.layout)

    const bounds = this.layoutBounds(layout)
    const margin = 100
    const frameWidth = bounds.maxX - bounds.minX + margin * 2
    const frameHeight = bounds.maxY - bounds.minY + margin * 2
    const spot = await this.builder.findSpace(frameWidth, frameHeight)

    let frame: Frame | undefined
    if (options.createFrame !== false) {
      frame = await registerFrame(
        this.builder,
        this.lastCreated,
        frameWidth,
        frameHeight,
        spot,
        options.frameTitle,
      )
    } else {
      clearActiveFrame(this.builder)
    }

    const { offsetX, offsetY } = this.calculateOffset(
      spot,
      frameWidth,
      frameHeight,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    )

    const { map, positions } = await this.createNodes(
      data,
      layout,
      offsetX,
      offsetY,
      existingMode,
      existing,
    )
    // Widgets are created without syncing so we can validate edges first.
    const finalLayout: LayoutResult = { nodes: positions, edges: layout.edges }
    await this.createConnectorsAndZoom(data, finalLayout, map, frame)
  }

  public async processGraphWithLayout(
    graph: GraphData,
    layout: LayoutResult,
    options: ProcessOptions = {},
  ): Promise<void> {
    this.nodeIdMap = {}
    this.validateGraph(graph)
    const existingMode: ExistingNodeMode = options.existingMode ?? 'move'
    const existing = await this.collectExistingNodes(graph)
    const bounds = this.layoutBounds(layout)
    const margin = 100
    const frameWidth = bounds.maxX - bounds.minX + margin * 2
    const frameHeight = bounds.maxY - bounds.minY + margin * 2
    const spot = await this.builder.findSpace(frameWidth, frameHeight)

    let frame: Frame | undefined
    if (options.createFrame !== false) {
      frame = await registerFrame(
        this.builder,
        this.lastCreated,
        frameWidth,
        frameHeight,
        spot,
        options.frameTitle,
      )
    } else {
      clearActiveFrame(this.builder)
    }

    const { offsetX, offsetY } = this.calculateOffset(
      spot,
      frameWidth,
      frameHeight,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    )

    const { map, positions } = await this.createNodes(
      graph,
      layout,
      offsetX,
      offsetY,
      existingMode,
      existing,
    )

    const shiftedEdges = layout.edges.map((edge) => ({
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
    }))

    const finalLayout: LayoutResult = { nodes: positions, edges: shiftedEdges }
    await this.createConnectorsAndZoom(graph, finalLayout, map, frame)
  }

  // undoLast inherited from UndoableProcessor

  /**
   * Determine the bounding box for positioned nodes.
   */
  private layoutBounds(layout: LayoutResult) {
    return boundingBoxFromTopLeft(layout.nodes)
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
    return frameOffset(spot, frameWidth, frameHeight, bounds, margin)
  }

  /**
   * Inject coordinates for existing widgets into the layout input when needed.
   *
   * @param data - Normalised graph data ready for layout.
   * @param existing - Map of node IDs to widgets found on the board.
   * @param mode - Behaviour for existing widgets.
   * @returns Graph data potentially enriched with node coordinates.
   */
  private buildLayoutInput(
    data: GraphData,
    existing: Record<string, BoardItem | undefined>,
    mode: ExistingNodeMode,
  ): GraphData {
    if (mode !== 'layout') {
      return data
    }
    return {
      nodes: data.nodes.map((n) => {
        const w = existing[n.id] as { x?: number; y?: number } | undefined
        return w && typeof w.x === 'number' && typeof w.y === 'number'
          ? { ...n, metadata: { ...(n.metadata ?? {}), x: w.x, y: w.y } }
          : n
      }),
      edges: data.edges,
    }
  }

  /**
   * Delegate nested layout processing to the dedicated hierarchy processor.
   *
   * @param graph - Source graph data or hierarchy.
   * @param opts - User-specified options for frame creation.
   */
  private async processNestedGraph(
    graph: GraphData | HierNode[],
    opts: ProcessOptions,
  ): Promise<void> {
    const hp = new HierarchyProcessor(this.builder)
    const hierarchy = Array.isArray(graph) ? graph : edgesToHierarchy(graph)
    await hp.processHierarchy(hierarchy, {
      createFrame: opts.createFrame,
      frameTitle: opts.frameTitle,
    })
    this.lastCreated = hp.getLastCreated()
  }

  /** Collect selected widgets matching graph nodes. */
  private async collectExistingNodes(
    graph: GraphData,
  ): Promise<Record<string, BoardItem | undefined>> {
    const map: Record<string, BoardItem | undefined> = {}
    for (const node of graph.nodes) {
      map[node.id] = await this.builder.findNodeInSelection(node.type, node.label)
    }
    return map
  }

  /**
   * Create nodes for the provided graph using the layout offsets.
   */
  private async createNodes(
    graph: GraphData,
    layout: LayoutResult,
    offsetX: number,
    offsetY: number,
    mode: ExistingNodeMode,
    existing: Record<string, BoardItem | undefined>,
  ): Promise<{
    map: Record<string, BoardItem>
    positions: Record<string, PositionedNode>
  }> {
    const map: Record<string, BoardItem> = {}
    const positions: Record<string, PositionedNode> = {}
    for (const node of graph.nodes) {
      const pos = layout.nodes[node.id]
      if (!pos) {
        throw new Error(`Missing layout for node ${node.id}`)
      }
      const target: PositionedNode = {
        ...pos,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }
      const found = existing[node.id]
      let widget: BoardItem
      if (found) {
        widget = found
        if (mode !== 'ignore') {
          const movable = widget as {
            x?: number
            y?: number
            sync?: () => Promise<void>
          }
          movable.x = target.x
          movable.y = target.y
          await maybeSync(movable)
          positions[node.id] = { ...target, id: node.id }
        } else {
          const w = widget as {
            x?: number
            y?: number
            width?: number
            height?: number
          }
          positions[node.id] = {
            id: node.id,
            x: w.x ?? target.x,
            y: w.y ?? target.y,
            width: w.width ?? target.width,
            height: w.height ?? target.height,
          }
        }
      } else {
        widget = await this.builder.createNode(node, target)
        this.registerCreated(widget)
        positions[node.id] = { ...target, id: node.id }
      }
      await this.applyNodeOverrides(node, widget)
      map[node.id] = widget
      this.nodeIdMap[node.id] = widget.id
    }
    return { map, positions }
  }

  /**
   * Apply Mermaid style overrides to a node widget when provided in metadata.
   */
  private async applyNodeOverrides(node: NodeData, widget: BoardItem): Promise<void> {
    const metadata = node.metadata as MermaidNodeMetadata | undefined
    if (!metadata) {
      return
    }
    const { styleOverrides, shape } = metadata
    if (!styleOverrides && !shape) {
      return
    }
    if ((widget as { type?: string }).type !== 'shape') {
      return
    }
    const style: Record<string, unknown> = {}
    if (styleOverrides?.fillColor) {
      style.fillColor = styleOverrides.fillColor
    }
    if (styleOverrides?.borderColor) {
      style.borderColor = styleOverrides.borderColor
    }
    if (styleOverrides?.borderWidth !== undefined) {
      style.borderWidth = styleOverrides.borderWidth
    }
    if (styleOverrides?.textColor) {
      style.color = styleOverrides.textColor
    }
    const template: TemplateElement = {}
    if (Object.keys(style).length) {
      template.style = style
    }
    if (typeof shape === 'string') {
      template.shape = shape
    }
    if (!template.style && !template.shape) {
      return
    }
    const interaction = this.builder.beginShapeInteraction(widget as BaseItem)
    interaction.applyTemplate(template, node.label)
    await interaction.commit()
  }

  /**
   * Connect nodes and zoom the board to the created content.
   */
  private async createConnectorsAndZoom(
    graph: GraphData,
    layout: LayoutResult,
    nodeMap: Record<string, BoardItem>,
    frame?: Frame,
  ): Promise<void> {
    const edgeHints = computeEdgeHints(graph, layout)
    const connectors = await this.builder.createEdges(graph.edges, nodeMap, edgeHints)
    this.registerCreated(connectors)
    await this.syncOrUndo([...Object.values(nodeMap), ...connectors])
    if (frame) {
      await this.builder.zoomTo(frame)
    } else {
      await this.builder.zoomTo(Object.values(nodeMap))
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
      throw new Error('Invalid graph format')
    }

    const nodeIds = new Set(graph.nodes.map((n) => n.id))
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from)) {
        throw new Error(`Edge references missing node: ${edge.from}`)
      }
      if (!nodeIds.has(edge.to)) {
        throw new Error(`Edge references missing node: ${edge.to}`)
      }
    }
  }
}
