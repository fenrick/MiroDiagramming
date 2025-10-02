import type { BaseItem, Frame, Group, GroupableItem } from '@mirohq/websdk-types'

import { maybeSync } from '../../board/board'
import { type BoardBuilder } from '../../board/board-builder'
import { clearActiveFrame, registerFrame } from '../../board/frame-utilities'
import type { TemplateElement } from '../../board/templates'
import { layoutEngine, type LayoutResult } from '../layout/elk-layout'
import { layoutGraphDagre } from '../layout/dagre-layout'
import { type UserLayoutOptions } from '../layout/elk-options'
import type { PositionedNode } from '../layout/layout-core'
import { boundingBoxFromTopLeft, computeEdgeHints, frameOffset } from '../layout/layout-utilities'
import type { HierNode } from '../layout/nested-layout'
import { fileUtilities } from '../utils/file-utilities'

import { edgesToHierarchy, hierarchyToEdges } from './convert'
import * as log from '../../logger'
import { type GraphData, graphService, type NodeData } from './graph-service'
import { HierarchyProcessor } from './hierarchy-processor'
import { isNestedAlgorithm } from './layout-modes'
import { UndoableProcessor } from './undoable-processor'

/** Board widget or group item. */
type BoardItem = BaseItem | Group

const isBaseItem = (item: BoardItem): item is BaseItem => {
  return 'type' in item && item.type !== 'group'
}

interface MermaidNodeMetadata {
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

  private computeSubgraphMaps(graph: GraphData): {
    subgraphChildren: Map<string, string[]>
    containerParent: Map<string, string>
  } {
    const subgraphChildren = new Map<string, string[]>()
    const containerParent = new Map<string, string>() // subgraphId -> parent subgraph id
    for (const n of graph.nodes) {
      const meta = n.metadata as { parent?: string; isSubgraph?: boolean } | undefined
      if (meta?.parent) {
        const list = subgraphChildren.get(meta.parent) ?? []
        list.push(n.id)
        subgraphChildren.set(meta.parent, list)
        if (meta.isSubgraph) {
          containerParent.set(n.id, meta.parent)
        }
      }
    }
    return { subgraphChildren, containerParent }
  }

  private async createContainerFromProxy(
    name: string,
    proxy: PositionedNode,
    offsetX: number,
    offsetY: number,
  ): Promise<BoardItem> {
    const centerX = proxy.x + offsetX + proxy.width / 2
    const centerY = proxy.y + offsetY + proxy.height / 2
    return this.builder.createNode(
      { id: name, label: name, type: 'Composite' },
      { x: centerX, y: centerY, width: proxy.width, height: proxy.height },
    )
  }

  private async createContainerFromChildren(
    name: string,
    children: readonly string[],
    layoutNodes: ReadonlyMap<string, PositionedNode>,
    offsetX: number,
    offsetY: number,
  ): Promise<BoardItem> {
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    for (const id of children) {
      const pos = layoutNodes.get(id)
      if (!pos) continue
      const x = pos.x + offsetX
      const y = pos.y + offsetY
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + pos.width)
      maxY = Math.max(maxY, y + pos.height)
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
      // fallback minimal container
      return this.builder.createNode(
        { id: name, label: name, type: 'Composite' },
        {
          x: offsetX,
          y: offsetY,
          width: 200,
          height: 120,
        },
      )
    }
    const padding = 40
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2
    const centerX = minX + (maxX - minX) / 2
    const centerY = minY + (maxY - minY) / 2
    return this.builder.createNode(
      { id: name, label: name, type: 'Composite' },
      { x: centerX, y: centerY, width, height },
    )
  }

  private async tintContainer(container: BaseItem, name: string): Promise<void> {
    const palette = ['#F2F4FC', '#EFF9EC', '#FFEEDE', '#FEF2FF', '#FFFAE7', '#F7F7F7']
    let hash = 0
    for (let index = 0; index < name.length; index += 1) {
      const code = name.codePointAt(index) ?? 0
      hash = (hash * 31 + code) >>> 0
    }
    const colorIndex = hash % palette.length
    const color = palette.at(colorIndex) ?? palette[0]
    const interaction = this.builder.beginShapeInteraction(container)
    interaction.applyTemplate({ style: { fillColor: color } }, name)
    await interaction.commit()
  }

  /** Mapping from node ID to created widget ID for the last run. */
  public getNodeIdMap(): Record<string, string> {
    return { ...this.nodeIdMap }
  }

  /**
   * Load a JSON graph file and process it.
   */
  public async processFile(file: File, options: ProcessOptions = {}): Promise<void> {
    fileUtilities.validateFile(file)
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
    const { frame, offsetX, offsetY } = await this.prepareLayoutPlacement(layout, options)

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
    const { frame, offsetX, offsetY, bounds } = await this.prepareLayoutPlacement(layout, options)

    const { map, positions } = await this.createNodes(
      graph,
      layout,
      offsetX,
      offsetY,
      existingMode,
      existing,
    )
    const converge = (options.layout as { converge?: boolean } | undefined)?.converge === true
    if (converge) {
      await this.convergeAndApply(graph, layout, positions, map, {
        frame,
        offsetX,
        offsetY,
        originalBounds: bounds,
        layoutOptions: options.layout,
      })
    } else {
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
        hintSides: edge.hintSides,
      }))
      const finalLayout: LayoutResult = { nodes: positions, edges: shiftedEdges }
      await this.createConnectorsAndZoom(graph, finalLayout, map, frame)
    }
  }

  private async convergeAndApply(
    graph: GraphData,
    _initial: LayoutResult,
    initialPositions: Record<string, PositionedNode>,
    map: Record<string, BaseItem | Group>,
    context: {
      frame?: Frame
      offsetX: number
      offsetY: number
      originalBounds: { minX: number; minY: number; maxX: number; maxY: number }
      layoutOptions?: Partial<
        UserLayoutOptions & {
          nodeSpacing?: number
          rankSpacing?: number
          converge?: boolean
          gridSnap?: number
        }
      >
    },
  ): Promise<void> {
    const measurements = this.measureWidgetSizes(map)
    const updatedGraph = this.mergeMeasuredSizes(graph, measurements, initialPositions)
    const converged = await this.computeConvergedLayout(updatedGraph, context)
    const snap = this.createSnapper(context.layoutOptions?.gridSnap ?? 8)
    await this.applyConvergedNodePositions(
      graph.nodes,
      converged.layout.nodes,
      map,
      {
        offsetX: context.offsetX + converged.deltaX,
        offsetY: context.offsetY + converged.deltaY,
      },
      snap,
    )
    const finalLayout = this.shiftLayout(converged.layout, {
      offsetX: context.offsetX + converged.deltaX,
      offsetY: context.offsetY + converged.deltaY,
    })
    await this.createConnectorsAndZoom(graph, finalLayout, map, context.frame)
  }

  private measureWidgetSizes(
    widgets: Record<string, BaseItem | Group>,
  ): Map<string, { width: number; height: number }> {
    const measured = new Map<string, { width: number; height: number }>()
    for (const [id, item] of Object.entries(widgets)) {
      const width = (item as { width?: number }).width
      const height = (item as { height?: number }).height
      if (typeof width === 'number' && typeof height === 'number') {
        measured.set(id, { width, height })
      }
    }
    return measured
  }

  private mergeMeasuredSizes(
    graph: GraphData,
    measurements: ReadonlyMap<string, { width: number; height: number }>,
    initialPositions: Record<string, PositionedNode>,
  ): GraphData {
    const epsilon = 3
    const keepWithinTolerance = (previous: number | undefined, measuredValue: number): number => {
      if (previous === undefined) {
        return measuredValue
      }
      return Math.abs(measuredValue - previous) <= epsilon ? previous : measuredValue
    }

    return {
      nodes: graph.nodes.map((node) => {
        const measurement = measurements.get(node.id)
        if (!measurement) {
          return node
        }
        const previous = initialPositions[node.id]
        const width = keepWithinTolerance(previous?.width, measurement.width)
        const height = keepWithinTolerance(previous?.height, measurement.height)
        return {
          ...node,
          metadata: {
            ...node.metadata,
            width,
            height,
          },
        }
      }),
      edges: graph.edges,
    }
  }

  private async computeConvergedLayout(
    graph: GraphData,
    context: {
      originalBounds: { minX: number; minY: number; maxX: number; maxY: number }
      layoutOptions?: Partial<
        UserLayoutOptions & {
          nodeSpacing?: number
          rankSpacing?: number
          converge?: boolean
          gridSnap?: number
        }
      >
    },
  ): Promise<{ layout: LayoutResult; deltaX: number; deltaY: number }> {
    const spacing = context.layoutOptions?.spacing ?? 50
    const direction = context.layoutOptions?.direction ?? 'RIGHT'
    const layout = await layoutGraphDagre(graph, {
      direction,
      nodeSpacing: context.layoutOptions?.nodeSpacing ?? spacing,
      rankSpacing: context.layoutOptions?.rankSpacing ?? spacing,
    })
    const bounds = this.layoutBounds(layout)
    return {
      layout,
      deltaX: context.originalBounds.minX - bounds.minX,
      deltaY: context.originalBounds.minY - bounds.minY,
    }
  }

  private createSnapper(gridSize: number): (value: number) => number {
    if (gridSize <= 0) {
      return (value) => value
    }
    return (value) => Math.round(value / gridSize) * gridSize
  }

  private async applyConvergedNodePositions(
    nodes: GraphData['nodes'],
    layoutNodes: Record<string, PositionedNode>,
    map: Record<string, BaseItem | Group>,
    offsets: { offsetX: number; offsetY: number },
    snap: (value: number) => number,
  ): Promise<void> {
    for (const node of nodes) {
      const pos = layoutNodes[node.id]
      if (!pos) {
        continue
      }
      const item = map[node.id] as
        | { x?: number; y?: number; sync?: () => Promise<void> }
        | undefined
      if (!item) {
        continue
      }
      item.x = snap(pos.x + offsets.offsetX + pos.width / 2)
      item.y = snap(pos.y + offsets.offsetY + pos.height / 2)
      await maybeSync(item)
    }
  }

  private shiftLayout(
    layout: LayoutResult,
    offsets: { offsetX: number; offsetY: number },
  ): LayoutResult {
    const nodes = Object.fromEntries(
      Object.entries(layout.nodes).map(([id, position]) => [
        id,
        {
          ...position,
          id,
          x: position.x + offsets.offsetX,
          y: position.y + offsets.offsetY,
        },
      ]),
    ) as Record<string, PositionedNode>

    const edges = layout.edges.map((edge) => ({
      startPoint: {
        x: edge.startPoint.x + offsets.offsetX,
        y: edge.startPoint.y + offsets.offsetY,
      },
      endPoint: {
        x: edge.endPoint.x + offsets.offsetX,
        y: edge.endPoint.y + offsets.offsetY,
      },
      bendPoints: edge.bendPoints?.map((point) => ({
        x: point.x + offsets.offsetX,
        y: point.y + offsets.offsetY,
      })),
      hintSides: edge.hintSides,
    }))

    return { nodes, edges }
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

  private async prepareLayoutPlacement(
    layout: LayoutResult,
    options: ProcessOptions,
  ): Promise<{
    frame?: Frame
    offsetX: number
    offsetY: number
    bounds: { minX: number; minY: number; maxX: number; maxY: number }
  }> {
    const bounds = this.layoutBounds(layout)
    const margin = 100
    const frameWidth = bounds.maxX - bounds.minX + margin * 2
    const frameHeight = bounds.maxY - bounds.minY + margin * 2
    const spot = await this.builder.findSpace(frameWidth, frameHeight)

    let frame: Frame | undefined
    if (options.createFrame === false) {
      clearActiveFrame(this.builder)
    } else {
      frame = await registerFrame(
        this.builder,
        this.lastCreated,
        frameWidth,
        frameHeight,
        spot,
        options.frameTitle,
      )
    }

    const { offsetX, offsetY } = this.calculateOffset(
      spot,
      frameWidth,
      frameHeight,
      { minX: bounds.minX, minY: bounds.minY },
      margin,
    )

    return { frame, offsetX, offsetY, bounds }
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
    const existingNodes = new Map<string, BoardItem | undefined>(Object.entries(existing))
    return {
      nodes: data.nodes.map((n) => {
        const w = existingNodes.get(n.id) as { x?: number; y?: number } | undefined
        return w && typeof w.x === 'number' && typeof w.y === 'number'
          ? { ...n, metadata: { ...n.metadata, x: w.x, y: w.y } }
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
    options: ProcessOptions,
  ): Promise<void> {
    const hp = new HierarchyProcessor(this.builder)
    const hierarchy = Array.isArray(graph) ? graph : edgesToHierarchy(graph)
    await hp.processHierarchy(hierarchy, {
      createFrame: options.createFrame,
      frameTitle: options.frameTitle,
    })
    this.lastCreated = hp.getLastCreated()
  }

  /** Collect selected widgets matching graph nodes. */
  private async collectExistingNodes(
    graph: GraphData,
  ): Promise<Record<string, BoardItem | undefined>> {
    const map = new Map<string, BoardItem | undefined>()
    for (const node of graph.nodes) {
      const widget = await this.builder.findNodeInSelection(node.type, node.label)
      map.set(node.id, widget)
    }
    return Object.fromEntries(map)
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
    const map = new Map<string, BoardItem>()
    const positions = new Map<string, PositionedNode>()
    const layoutNodes = new Map<string, PositionedNode>(Object.entries(layout.nodes))
    const existingNodes = new Map<string, BoardItem | undefined>(Object.entries(existing))
    const { subgraphChildren, containerParent } = this.computeSubgraphMaps(graph)

    const orderedSubgraphs = this.orderSubgraphs(subgraphChildren, containerParent)
    await this.instantiateSubgraphContainers(
      orderedSubgraphs,
      subgraphChildren,
      layoutNodes,
      offsetX,
      offsetY,
      map,
    )

    for (const node of graph.nodes) {
      if (this.isSubgraphNode(node)) {
        continue
      }

      const layoutPosition = this.requireLayoutPosition(layoutNodes, node.id)
      const shifted = this.shiftLayoutPosition(layoutPosition, offsetX, offsetY)
      const center = this.computeNodeCenter(shifted)
      const placement = await this.resolveWidgetPlacement(
        node,
        shifted,
        center,
        mode,
        existingNodes,
      )

      await this.applyNodeOverrides(node, placement.widget)
      map.set(node.id, placement.widget)
      positions.set(node.id, placement.position)
      this.nodeIdMap[node.id] = placement.widget.id
    }

    await this.groupSubgraphs(subgraphChildren, map)
    return { map: Object.fromEntries(map), positions: Object.fromEntries(positions) }
  }

  private orderSubgraphs(
    subgraphChildren: Map<string, string[]>,
    containerParent: Map<string, string>,
  ): string[] {
    const names = new Set<string>([...subgraphChildren.keys(), ...containerParent.keys()])
    const depthCache = new Map<string, number>()

    const depth = (id: string): number => {
      const cached = depthCache.get(id)
      if (cached !== undefined) {
        return cached
      }
      const parent = containerParent.get(id)
      if (!parent) {
        depthCache.set(id, 0)
        return 0
      }
      const computed = depth(parent) + 1
      depthCache.set(id, computed)
      return computed
    }

    return [...names].toSorted((a, b) => depth(b) - depth(a))
  }

  private async instantiateSubgraphContainers(
    orderedSubgraphs: readonly string[],
    subgraphChildren: Map<string, string[]>,
    layoutNodes: ReadonlyMap<string, PositionedNode>,
    offsetX: number,
    offsetY: number,
    map: Map<string, BoardItem>,
  ): Promise<void> {
    for (const name of orderedSubgraphs) {
      const container = await this.buildSubgraphContainer(
        name,
        subgraphChildren,
        layoutNodes,
        offsetX,
        offsetY,
      )
      if (!container) {
        continue
      }
      if (isBaseItem(container)) {
        await this.tintContainer(container, name)
      }
      this.registerCreated(container)
      map.set(name, container)
    }
  }

  private async buildSubgraphContainer(
    name: string,
    subgraphChildren: Map<string, string[]>,
    layoutNodes: ReadonlyMap<string, PositionedNode>,
    offsetX: number,
    offsetY: number,
  ): Promise<BoardItem | undefined> {
    const children = subgraphChildren.get(name)
    if (!children || children.length === 0) {
      return undefined
    }
    const proxy = layoutNodes.get(name)
    if (proxy) {
      return this.createContainerFromProxy(name, proxy, offsetX, offsetY)
    }
    return this.createContainerFromChildren(name, children, layoutNodes, offsetX, offsetY)
  }

  private isSubgraphNode(node: NodeData): boolean {
    const metadata = node.metadata as { isSubgraph?: boolean } | undefined
    return metadata?.isSubgraph ?? false
  }

  private requireLayoutPosition(
    layoutNodes: ReadonlyMap<string, PositionedNode>,
    id: string,
  ): PositionedNode {
    const position = layoutNodes.get(id)
    if (!position) {
      throw new Error(`Missing layout for node ${id}`)
    }
    return position
  }

  private shiftLayoutPosition(
    position: PositionedNode,
    offsetX: number,
    offsetY: number,
  ): PositionedNode {
    return { ...position, x: position.x + offsetX, y: position.y + offsetY }
  }

  private computeNodeCenter(position: PositionedNode): { x: number; y: number } {
    return {
      x: position.x + position.width / 2,
      y: position.y + position.height / 2,
    }
  }

  private async resolveWidgetPlacement(
    node: NodeData,
    target: PositionedNode,
    center: { x: number; y: number },
    mode: ExistingNodeMode,
    existingNodes: ReadonlyMap<string, BoardItem | undefined>,
  ): Promise<{ widget: BoardItem; position: PositionedNode }> {
    const found = existingNodes.get(node.id)
    if (!found) {
      const widget = await this.builder.createNode(node, {
        x: center.x,
        y: center.y,
        width: target.width,
        height: target.height,
      })
      this.registerCreated(widget)
      return { widget, position: { ...target, id: node.id } }
    }

    if (mode === 'ignore') {
      return { widget: found, position: this.extractExistingPosition(found, target, node.id) }
    }

    const movable = found as { x?: number; y?: number; sync?: () => Promise<void> }
    movable.x = center.x
    movable.y = center.y
    await maybeSync(movable)
    return { widget: found, position: { ...target, id: node.id } }
  }

  private extractExistingPosition(
    widget: BoardItem,
    fallback: PositionedNode,
    id: string,
  ): PositionedNode {
    const w = widget as { x?: number; y?: number; width?: number; height?: number }
    return {
      id,
      x: w.x ?? fallback.x,
      y: w.y ?? fallback.y,
      width: w.width ?? fallback.width,
      height: w.height ?? fallback.height,
    }
  }

  private async groupSubgraphs(
    subgraphChildren: Map<string, string[]>,
    nodeMap: ReadonlyMap<string, BoardItem>,
  ): Promise<void> {
    for (const [name, children] of subgraphChildren) {
      const container = nodeMap.get(name) as unknown as GroupableItem | undefined
      if (!container) {
        continue
      }
      const members = children
        .map((id) => nodeMap.get(id) as unknown as GroupableItem | undefined)
        .filter((item): item is GroupableItem => item !== undefined)
      if (members.length === 0) {
        continue
      }
      await this.groupItems(container, members)
    }
  }

  private async groupItems(container: GroupableItem, members: GroupableItem[]): Promise<void> {
    try {
      await this.builder.groupItems([container, ...members])
    } catch {
      // ignore grouping failures
    }
  }

  /**
   * Apply Mermaid style overrides to a node widget when provided in metadata.
   */
  private async applyNodeOverrides(node: NodeData, widget: BoardItem): Promise<void> {
    const metadata = node.metadata as MermaidNodeMetadata | undefined
    if (!metadata) {
      return
    }
    if (!metadata.styleOverrides && !metadata.shape) {
      return
    }
    if ((widget as { type?: string }).type !== 'shape') {
      return
    }
    const template = this.buildShapeTemplate(metadata)
    if (!template) {
      return
    }
    const beforeShape = (widget as { shape?: string }).shape
    const interaction = this.builder.beginShapeInteraction(widget as BaseItem)
    interaction.applyTemplate(template, node.label)
    await interaction.commit()
    const afterShape = (widget as { shape?: string }).shape
    log.info({ id: node.id, beforeShape, afterShape }, 'Applied Mermaid shape override')
  }

  private buildShapeTemplate(metadata: MermaidNodeMetadata): TemplateElement | undefined {
    const style = this.buildStyleOverrides(metadata.styleOverrides)
    const template: TemplateElement = {}
    if (style) {
      template.style = style
    }
    if (typeof metadata.shape === 'string') {
      template.shape = metadata.shape
    }
    return template.style || template.shape ? template : undefined
  }

  private buildStyleOverrides(
    styleOverrides: MermaidNodeMetadata['styleOverrides'],
  ): Record<string, unknown> | undefined {
    if (!styleOverrides) {
      return undefined
    }
    const style: Record<string, unknown> = {}
    const { fillColor, borderColor, textColor, borderWidth } = styleOverrides
    if (fillColor) {
      style.fillColor = fillColor
    }
    if (borderColor) {
      style.borderColor = borderColor
    }
    if (textColor) {
      style.color = textColor
    }
    if (borderWidth !== undefined) {
      style.borderWidth = borderWidth
    }
    return Object.keys(style).length > 0 ? style : undefined
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
    await (frame ? this.builder.zoomTo(frame) : this.builder.zoomTo(Object.values(nodeMap)))
  }

  /**
   * Ensure the provided graph data is valid.
   *
   * @throws {Error} If the graph does not have the expected top level format or
   *   if any edge references a non-existent node. The thrown error message
   *   provides details about the specific problem.
   */
  private validateGraph(
    graph: GraphData | { nodes?: unknown; edges?: unknown } | null | undefined,
  ): asserts graph is GraphData {
    if (
      graph === null ||
      graph === undefined ||
      !Array.isArray((graph as { nodes?: unknown }).nodes) ||
      !Array.isArray((graph as { edges?: unknown }).edges)
    ) {
      throw new Error('Invalid graph format')
    }

    const typedGraph = graph as GraphData
    const nodeIds = new Set(typedGraph.nodes.map((n) => n.id))
    for (const edge of typedGraph.edges) {
      if (!nodeIds.has(edge.from)) {
        throw new Error(`Edge references missing node: ${edge.from}`)
      }
      if (!nodeIds.has(edge.to)) {
        throw new Error(`Edge references missing node: ${edge.to}`)
      }
    }
  }
}
