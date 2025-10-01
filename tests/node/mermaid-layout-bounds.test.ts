// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import { __testables } from '../../src/core/mermaid/mermaid-layout'

const { computeNodeBounds } = __testables

const SVG_NS = 'http://www.w3.org/2000/svg'

describe('computeNodeBounds', () => {
  it('uses native getBBox results when available', () => {
    const group = document.createElementNS(SVG_NS, 'g') as SVGGElement
    group.getBBox = () => ({ x: 10, y: 20, width: 30, height: 40 })

    expect(computeNodeBounds(group)).toEqual({ x: 10, y: 20, width: 30, height: 40 })
  })

  it('falls back to manual geometry when getBBox throws', () => {
    const group = document.createElementNS(SVG_NS, 'g') as SVGGElement
    group.setAttribute('transform', 'translate(5,10)')
    group.getBBox = () => {
      throw new Error('unsupported')
    }

    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', '10')
    rect.setAttribute('height', '20')
    group.appendChild(rect)

    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('cx', '30')
    circle.setAttribute('cy', '30')
    circle.setAttribute('r', '5')
    group.appendChild(circle)

    const ellipse = document.createElementNS(SVG_NS, 'ellipse')
    ellipse.setAttribute('cx', '60')
    ellipse.setAttribute('cy', '10')
    ellipse.setAttribute('rx', '4')
    ellipse.setAttribute('ry', '6')
    group.appendChild(ellipse)

    const polygon = document.createElementNS(SVG_NS, 'polygon')
    polygon.setAttribute('points', '70,0 80,10 70,20')
    polygon.setAttribute('transform', 'translate(2,3)')
    group.appendChild(polygon)

    const path = document.createElementNS(SVG_NS, 'path') as SVGPathElement & {
      dataset: DOMStringMap & { bounds?: string }
    }
    path.dataset.bounds = JSON.stringify({ x: 100, y: 100, width: 10, height: 5 })
    group.appendChild(path)

    const bounds = computeNodeBounds(group)
    expect(bounds.x).toBeCloseTo(5)
    expect(bounds.y).toBeCloseTo(10)
    expect(bounds.width).toBeGreaterThan(0)
    expect(bounds.height).toBeGreaterThan(0)
  })
})
