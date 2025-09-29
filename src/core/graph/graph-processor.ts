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
      // Measure actual sizes from created widgets
      const epsilon = 3
      const measured: Record<string, { width: number; height: number }> = {}
      for (const [id, item] of Object.entries(map)) {
        const w = (item as { width?: number }).width
        const h = (item as { height?: number }).height
        if (typeof w === 'number' && typeof h === 'number') {
          measured[id] = { width: w, height: h }
        }
      }
      // Build updated graph with measured sizes as metadata
      const updated: GraphData = {
        nodes: graph.nodes.map((n) => {
          const m = measured[n.id]
          if (!m) return n
          const prevW = positions[n.id]?.width
          const prevH = positions[n.id]?.height
          const width = prevW && Math.abs(m.width - prevW) <= epsilon ? prevW : m.width
          const height = prevH && Math.abs(m.height - prevH) <= epsilon ? prevH : m.height
          return { ...n, metadata: { ...(n.metadata ?? {}), width, height } }
        }),
        edges: graph.edges,
      }
      // Re-run Dagre using measured sizes
      const spacing = options.layout?.spacing ?? 50
      const direction = options.layout?.direction ?? 'RIGHT'
      const second = await layoutGraphDagre(updated, {
        direction,
        nodeSpacing: (options.layout as any)?.nodeSpacing ?? spacing,
        rankSpacing: (options.layout as any)?.rankSpacing ?? spacing,
      })
      const newBounds = this.layoutBounds(second)
      const dx = bounds.minX - newBounds.minX
      const dy = bounds.minY - newBounds.minY
      const grid = (options.layout as { gridSnap?: number } | undefined)?.gridSnap ?? 8
      const snap = (v: number) => (grid > 0 ? Math.round(v / grid) * grid : v)
      // Move widgets to new positions
      for (const n of graph.nodes) {
        const pos = second.nodes[n.id]
        if (!pos) continue
        const item = map[n.id] as { x?: number; y?: number; sync?: () => Promise<void> } | undefined
        if (!item) continue
        const nx = snap(pos.x + offsetX + dx + pos.width / 2)
        const ny = snap(pos.y + offsetY + dy + pos.height / 2)
        item.x = nx
        item.y = ny
        await maybeSync(item)
      }
      const shiftedEdges2 = second.edges.map((edge) => ({
        startPoint: { x: edge.startPoint.x + offsetX + dx, y: edge.startPoint.y + offsetY + dy },
        endPoint: { x: edge.endPoint.x + offsetX + dx, y: edge.endPoint.y + offsetY + dy },
        bendPoints: edge.bendPoints?.map((pt) => ({
          x: pt.x + offsetX + dx,
          y: pt.y + offsetY + dy,
        })),
        hintSides: edge.hintSides,
      }))
      const finalLayout: LayoutResult = {
        nodes: Object.fromEntries(
          Object.entries(second.nodes).map(([id, p]) => [
            id,
            { ...p, x: p.x + offsetX + dx, y: p.y + offsetY + dy, id } as any,
          ]),
        ),
        edges: shiftedEdges2,
      }
      await this.createConnectorsAndZoom(graph, finalLayout, map, frame)
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
    // Build nested subgraph relationships for both leaves and subgraph containers
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
    // Create subgraph containers first, deepest-first, to render behind descendants
    const depth = (id: string): number => {
      let d = 0
      let cur = id
      while (containerParent.has(cur)) {
        d += 1
        cur = containerParent.get(cur)!
      }
      return d
    }
    const subgraphNames = [...new Set([...subgraphChildren.keys(), ...containerParent.keys()])]
    subgraphNames.sort((a, b) => depth(b) - depth(a))
    for (const name of subgraphNames) {
      const children = subgraphChildren.get(name) ?? []
      if (children.length === 0) continue
      // Prefer using container proxy position from layout when present
      const proxy = layout.nodes[name]
      let container
      if (proxy) {
        const centerX = proxy.x + offsetX + proxy.width / 2
        const centerY = proxy.y + offsetY + proxy.height / 2
        container = await this.builder.createNode(
          { id: name, label: name, type: 'Composite' },
          { x: centerX, y: centerY, width: proxy.width, height: proxy.height },
        )
      } else {
        // Fallback: compute from children bbox
        let minX = Number.POSITIVE_INFINITY
        let minY = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let maxY = Number.NEGATIVE_INFINITY
        for (const id of children) {
          const pos = layout.nodes[id]
          if (!pos) continue
          const x = pos.x + offsetX
          const y = pos.y + offsetY
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x + pos.width)
          maxY = Math.max(maxY, y + pos.height)
        }
        if (!Number.isFinite(minX) || !Number.isFinite(minY)) continue
        const padding = 40
        const width = maxX - minX + padding * 2
        const height = maxY - minY + padding * 2
        const centerX = minX + (maxX - minX) / 2
        const centerY = minY + (maxY - minY) / 2
        container = await this.builder.createNode(
          { id: name, label: name, type: 'Composite' },
          { x: centerX, y: centerY, width, height },
        )
      }
      // Soft tint
      try {
        const palette = ['#F2F4FC', '#EFF9EC', '#FFEEDE', '#FEF2FF', '#FFFAE7', '#F7F7F7']
        let hash = 0
        for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
        const color = palette[hash % palette.length]!
        const interaction = this.builder.beginShapeInteraction(container as BaseItem)
        interaction.applyTemplate({ style: { fillColor: color } }, name)
        await interaction.commit()
      } catch {}
      this.registerCreated(container)
      map[name] = container
    }
    for (const node of graph.nodes) {
      const isSubgraph =
        (node.metadata as { isSubgraph?: boolean } | undefined)?.isSubgraph === true
      if (isSubgraph) {
        // Skip creating a widget for subgraph container; a frame will be created later.
        continue
      }
      const pos = layout.nodes[node.id]
      if (!pos) {
        throw new Error(`Missing layout for node ${node.id}`)
      }
      // Positions from layout are top-left; Miro expects centre coordinates.
      const centerX = pos.x + offsetX + pos.width / 2
      const centerY = pos.y + offsetY + pos.height / 2
      const target: PositionedNode = { ...pos, x: pos.x + offsetX, y: pos.y + offsetY }
      const found = existing[node.id]
      let widget: BoardItem
      if (found) {
        widget = found
        if (mode === 'ignore') {
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
        } else {
          const movable = widget as {
            x?: number
            y?: number
            sync?: () => Promise<void>
          }
          movable.x = centerX
          movable.y = centerY
          await maybeSync(movable)
          positions[node.id] = { ...target, id: node.id }
        }
      } else {
        widget = await this.builder.createNode(node, {
          x: centerX,
          y: centerY,
          width: target.width,
          height: target.height,
        })
        this.registerCreated(widget)
        positions[node.id] = { ...target, id: node.id }
      }
      await this.applyNodeOverrides(node, widget)
      map[node.id] = widget
      this.nodeIdMap[node.id] = widget.id
    }
    // Group subgraph containers with their children
    await this.groupSubgraphs(subgraphChildren, map)
    return { map, positions }
  }

  private async groupSubgraphs(
    subgraphChildren: Map<string, string[]>,
    nodeMap: Record<string, BoardItem>,
  ): Promise<void> {
    for (const [name, children] of subgraphChildren) {
      const container = nodeMap[name] as unknown as GroupableItem | undefined
      if (!container) continue
      const members: GroupableItem[] = []
      for (const id of children) {
        const w = nodeMap[id] as unknown as GroupableItem | undefined
        if (w) members.push(w)
      }
      if (members.length === 0) continue
      try {
        await this.builder.groupItems([container, ...members])
      } catch {
        // ignore grouping failures
      }
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
    const { styleOverrides, shape } = metadata
    if (!styleOverrides && !shape) {
      return
    }
    if ((widget as { type?: string }).type !== 'shape') {
      return
    }
    const beforeShape = (widget as { shape?: string }).shape
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
    if (Object.keys(style).length > 0) {
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
    const afterShape = (widget as { shape?: string }).shape
    log.info({ id: node.id, beforeShape, afterShape }, 'Applied Mermaid shape override')
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
