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
    throw new TypeError('Mermaid layout requires a browser-like DOM environment')
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
  document.body.append(container)
  return container
}

function removeHiddenContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.remove()
  }
}

function parseTranslate(transform: string | null): { x: number; y: number } {
  if (!transform) {
    return { x: 0, y: 0 }
  }
  const start = transform.indexOf('(')
  const end = transform.indexOf(')', start + 1)
  if (start === -1 || end === -1 || end <= start + 1) {
    return { x: 0, y: 0 }
  }
  const content = transform.slice(start + 1, end)
  const parts = content
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
  const x = Number.parseFloat(parts[0] ?? '0')
  const y = Number.parseFloat((parts.length > 1 ? parts[1] : parts[0]) ?? '0')
  return { x, y }
}

function decodePoints(attribute: string | null): { x: number; y: number }[] | undefined {
  if (!attribute) {
    return undefined
  }
  try {
    let json: string
    if (typeof globalThis.atob === 'function') {
      json = globalThis.atob(attribute)
    } else {
      interface NodeBufferModule {
        from: (input: string, encoding: string) => { toString: (encoding: string) => string }
      }
      const nodeBuffer = (globalThis as { Buffer?: NodeBufferModule }).Buffer
      json = nodeBuffer ? nodeBuffer.from(attribute, 'base64').toString('utf8') : attribute
    }
    const parsed = JSON.parse(json) as { x: number; y: number }[]
    if (!Array.isArray(parsed)) {
      return undefined
    }
    return parsed.map((pt) => ({ x: Number(pt.x), y: Number(pt.y) }))
  } catch {
    return undefined
  }
}

function computeNodeBounds(nodeElement: SVGGElement): {
  x: number
  y: number
  width: number
  height: number
} {
  if (typeof nodeElement.getBBox === 'function') {
    try {
      const box = nodeElement.getBBox()
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

  const groupOffset = parseTranslate(nodeElement.getAttribute('transform'))

  const updateBounds = (points: { x: number; y: number }[]) => {
    for (const { x, y } of points) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        continue
      }
      minX = Math.min(minX, groupOffset.x + x)
      minY = Math.min(minY, groupOffset.y + y)
      maxX = Math.max(maxX, groupOffset.x + x)
      maxY = Math.max(maxY, groupOffset.y + y)
    }
  }

  for (const element of nodeElement.querySelectorAll('rect, circle, ellipse, polygon, path')) {
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
      continue
    }
    if (tag === 'circle') {
      const cx = Number.parseFloat(element.getAttribute('cx') ?? '0')
      const cy = Number.parseFloat(element.getAttribute('cy') ?? '0')
      const r = Number.parseFloat(element.getAttribute('r') ?? '0')
      updateBounds([
        { x: cx - r, y: cy - r },
        { x: cx + r, y: cy + r },
      ])
      continue
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
      continue
    }
    if (tag === 'polygon') {
      const subTransform = parseTranslate(element.getAttribute('transform'))
      const pointsAttribute = element.getAttribute('points') ?? ''
      const pointPairs = pointsAttribute
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map((value) => Number.parseFloat(value)))
        .filter(
          (pair): pair is [number, number] =>
            pair.length === 2 && pair.every((n) => Number.isFinite(n)),
        )
        .map(([x, y]) => ({ x: x + subTransform.x, y: y + subTransform.y }))
      updateBounds(pointPairs)
      continue
    }
    if (tag === 'path') {
      // Path shapes are complex; rely on stroke bounding approximated via data attribute when available.
      const dataBounds = (element as HTMLElement | SVGElement).dataset?.bounds ?? null
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
          continue
        } catch {
          // ignore decode errors for path data-bounds
        }
      }
    }
  }

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
  // Collect graphic groups that represent actual nodes; exclude label-only wrappers.
  const nodeElements = [
    ...svgElement.querySelectorAll<SVGGElement>('g.node, g.actor, g.classGroup, g.state'),
  ]
  const byDomId = new Map<string, SVGGElement>()
  for (const element of nodeElements) {
    if (element.id) {
      byDomId.set(element.id, element)
    }
  }
  let fallbackIndex = 0

  for (const node of graph.nodes) {
    const domId = (node.metadata as { domId?: string } | undefined)?.domId
    const element = domId ? byDomId.get(domId) : undefined
    const resolvedElement = element ?? nodeElements[fallbackIndex++]
    if (!resolvedElement) {
      throw new Error(`Mermaid layout missing node element for '${node.id}'`)
    }
    const bounds = computeNodeBounds(resolvedElement)
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
    const path = domId ? svgElement.querySelector(`path[data-id="${domId}"]`) : null
    const points = path ? decodePoints(path.dataset.points ?? null) : undefined
    if (points && points.length >= 2) {
      const start = points[0] as { x: number; y: number }
      const end = points.at(-1) as { x: number; y: number }
      const rest = points.slice(1, -1)
      return {
        startPoint: start,
        endPoint: end,
        bendPoints: rest.length > 0 ? rest : undefined,
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
    const svgElement = container.querySelector('svg')
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
