import mermaid from 'mermaid'

import type { GraphData } from '../graph/graph-service'
import type { LayoutResult } from '../layout/elk-layout'
import type { PositionedEdge, PositionedNode } from '../layout/layout-core'

import { ensureMermaidInitialized } from './config'

type MermaidLayoutOptions = Readonly<{
  config?: Parameters<typeof mermaid.initialize>[0]
}>

function ensureDom(): void {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new Error('Mermaid layout requires a browser-like DOM environment')
  }
}

const HIDDEN_CONTAINER_STYLE = Object.freeze({
  position: 'absolute',
  left: '-10000px',
  top: '-10000px',
  visibility: 'hidden',
})

function createHiddenContainer(): HTMLElement {
  ensureDom()
  const container = document.createElement('div')
  Object.assign(container.style, HIDDEN_CONTAINER_STYLE)
  document.body.appendChild(container)
  return container
}

function removeHiddenContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

function parseTranslate(transform: string | null): { x: number; y: number } {
  if (!transform) {
    return { x: 0, y: 0 }
  }
  const match = /translate\(([^,\s]+)(?:[,\s]+([^\s\)]+))?/i.exec(transform)
  if (!match) {
    return { x: 0, y: 0 }
  }
  const x = Number.parseFloat(match[1] ?? '0')
  const y = Number.parseFloat(match[2] ?? '0')
  return { x, y }
}

function decodePoints(attr: string | null): Array<{ x: number; y: number }> | undefined {
  if (!attr) {
    return undefined
  }
  try {
    let json: string
    if (typeof globalThis.atob === 'function') {
      json = globalThis.atob(attr)
    } else {
      type NodeBufferModule = {
        from: (input: string, encoding: string) => { toString: (encoding: string) => string }
      }
      const nodeBuffer = (globalThis as { Buffer?: NodeBufferModule }).Buffer
      json = nodeBuffer ? nodeBuffer.from(attr, 'base64').toString('utf8') : attr
    }
    const parsed = JSON.parse(json) as Array<{ x: number; y: number }>
    if (!Array.isArray(parsed)) {
      return undefined
    }
    return parsed.map((pt) => ({ x: Number(pt.x), y: Number(pt.y) }))
  } catch {
    return undefined
  }
}

function computeNodeBounds(nodeEl: SVGGElement): {
  x: number
  y: number
  width: number
  height: number
} {
  if (typeof nodeEl.getBBox === 'function') {
    try {
      const box = nodeEl.getBBox()
      if (Number.isFinite(box.width) && Number.isFinite(box.height)) {
        return { x: box.x, y: box.y, width: box.width, height: box.height }
      }
    } catch {
      // Fall back to manual computation below
    }
  }

  // Manual bounding-box calculation when getBBox is unavailable (e.g., tests)
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  const groupOffset = parseTranslate(nodeEl.getAttribute('transform'))

  const updateBounds = (points: Array<{ x: number; y: number }>) => {
    for (const { x, y } of points) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      minX = Math.min(minX, groupOffset.x + x)
      minY = Math.min(minY, groupOffset.y + y)
      maxX = Math.max(maxX, groupOffset.x + x)
      maxY = Math.max(maxY, groupOffset.y + y)
    }
  }

  nodeEl.querySelectorAll('rect, circle, ellipse, polygon, path').forEach((element) => {
    const tag = element.tagName.toLowerCase()
    if (tag === 'rect') {
      const x = Number.parseFloat(element.getAttribute('x') ?? '0')
      const y = Number.parseFloat(element.getAttribute('y') ?? '0')
      const width = Number.parseFloat(element.getAttribute('width') ?? '0')
      const height = Number.parseFloat(element.getAttribute('height') ?? '0')
      updateBounds([
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ])
      return
    }
    if (tag === 'circle') {
      const cx = Number.parseFloat(element.getAttribute('cx') ?? '0')
      const cy = Number.parseFloat(element.getAttribute('cy') ?? '0')
      const r = Number.parseFloat(element.getAttribute('r') ?? '0')
      updateBounds([
        { x: cx - r, y: cy - r },
        { x: cx + r, y: cy + r },
      ])
      return
    }
    if (tag === 'ellipse') {
      const cx = Number.parseFloat(element.getAttribute('cx') ?? '0')
      const cy = Number.parseFloat(element.getAttribute('cy') ?? '0')
      const rx = Number.parseFloat(element.getAttribute('rx') ?? '0')
      const ry = Number.parseFloat(element.getAttribute('ry') ?? '0')
      updateBounds([
        { x: cx - rx, y: cy - ry },
        { x: cx + rx, y: cy + ry },
      ])
      return
    }
    if (tag === 'polygon') {
      const subTransform = parseTranslate(element.getAttribute('transform'))
      const pointsAttr = element.getAttribute('points') ?? ''
      const pointPairs = pointsAttr
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map((value) => Number.parseFloat(value)))
        .filter(
          (pair): pair is [number, number] => pair.length === 2 && pair.every(Number.isFinite),
        )
        .map(([x, y]) => ({ x: x + subTransform.x, y: y + subTransform.y }))
      updateBounds(pointPairs)
      return
    }
    if (tag === 'path') {
      // Path shapes are complex; rely on stroke bounding approximated via data attribute when available.
      const dataBounds = element.getAttribute('data-bounds')
      if (dataBounds) {
        try {
          const parsed = JSON.parse(dataBounds) as {
            x: number
            y: number
            width: number
            height: number
          }
          updateBounds([
            { x: parsed.x, y: parsed.y },
            { x: parsed.x + parsed.width, y: parsed.y + parsed.height },
          ])
          return
        } catch {}
      }
    }
  })

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return { x: groupOffset.x, y: groupOffset.y, width: 0, height: 0 }
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function mapNodesFromSvg(
  svgElement: SVGSVGElement,
  graph: GraphData,
): Record<string, PositionedNode> {
  const nodes: Record<string, PositionedNode> = {}
  const nodeElements = svgElement.querySelectorAll<SVGGElement>('g.node')
  const byDomId = new Map<string, SVGGElement>()
  nodeElements.forEach((el) => byDomId.set(el.id, el))

  for (const node of graph.nodes) {
    const domId = (node.metadata as { domId?: string } | undefined)?.domId
    const element = domId ? byDomId.get(domId) : undefined
    if (!element) {
      throw new Error(`Mermaid layout missing node element for '${node.id}'`)
    }
    const bounds = computeNodeBounds(element)
    nodes[node.id] = {
      id: node.id,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }
  }
  return nodes
}

function mapEdgesFromSvg(
  svgElement: SVGSVGElement,
  graph: GraphData,
  nodePositions: Record<string, PositionedNode>,
): PositionedEdge[] {
  return graph.edges.map((edge) => {
    const domId = (edge.metadata as { domId?: string } | undefined)?.domId
    const path = domId
      ? (svgElement.querySelector(`path[data-id="${domId}"]`) as SVGPathElement | null)
      : null
    const points = path ? decodePoints(path.getAttribute('data-points')) : undefined
    if (points && points.length >= 2) {
      const start = points[0]!
      const end = points[points.length - 1]!
      const rest = points.slice(1, -1)
      return {
        startPoint: start,
        endPoint: end,
        bendPoints: rest.length ? rest : undefined,
      }
    }
    const from = nodePositions[edge.from]
    const to = nodePositions[edge.to]
    const startPoint = from
      ? { x: from.x + from.width / 2, y: from.y + from.height / 2 }
      : { x: 0, y: 0 }
    const endPoint = to ? { x: to.x + to.width / 2, y: to.y + to.height / 2 } : { x: 0, y: 0 }
    return {
      startPoint,
      endPoint,
    }
  })
}

let renderSequence = 0

export async function computeMermaidLayout(
  source: string,
  graph: GraphData,
  options: MermaidLayoutOptions = {},
): Promise<LayoutResult> {
  ensureMermaidInitialized(options.config)
  ensureDom()
  renderSequence = (renderSequence + 1) % Number.MAX_SAFE_INTEGER
  const id = `mermaid-layout-${renderSequence}`
  const { svg } = await mermaid.mermaidAPI.render(id, source)
  const container = createHiddenContainer()
  try {
    container.innerHTML = svg
    const svgElement = container.querySelector('svg') as SVGSVGElement | null
    if (!svgElement) {
      throw new Error('Failed to render Mermaid diagram: SVG element missing')
    }
    const nodes = mapNodesFromSvg(svgElement, graph)
    const edges = mapEdgesFromSvg(svgElement, graph, nodes)
    return { nodes, edges }
  } finally {
    removeHiddenContainer(container)
  }
}
