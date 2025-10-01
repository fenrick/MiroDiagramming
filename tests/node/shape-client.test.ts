import type { Miro, Shape, ShapeStyle, StableClient } from '@mirohq/websdk-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ShapeData } from '../../src/core/utils/shape-client'
import { ShapeClient } from '../../src/core/utils/shape-client'

const baseStyle: ShapeStyle = {
  color: '#000000',
  fillColor: '#000000',
  fillOpacity: 1,
  fontFamily: 'arial' as ShapeStyle['fontFamily'],
  fontSize: 12,
  textAlign: 'left' as ShapeStyle['textAlign'],
  textAlignVertical: 'top' as ShapeStyle['textAlignVertical'],
  borderStyle: 'normal' as ShapeStyle['borderStyle'],
  borderOpacity: 1,
  borderColor: '#000000',
  borderWidth: 1,
}

function buildShape(overrides: Partial<Shape> = {}): Shape {
  const shape = {
    type: 'shape',
    x: 0,
    y: 0,
    rotation: 0,
    width: 100,
    height: 100,
    style: { ...baseStyle },
    ...overrides,
  }
  return shape as Shape
}

describe('ShapeClient', () => {
  const board = {
    createShape: vi.fn<(properties?: Record<string, unknown>) => Promise<Shape>>(),
    get: vi.fn<(query: { id?: string; type?: string }) => Promise<unknown[]>>(),
  }
  beforeEach(() => {
    board.createShape.mockReset()
    board.get.mockReset()
    const miroStub: Miro = { board: board as unknown as StableClient, clientVersion: 'test' }
    ;(globalThis as typeof globalThis & { miro?: Miro }).miro = miroStub
  })

  afterEach(() => {
    delete (globalThis as { miro?: unknown }).miro
  })

  it('creates shapes with sanitized style data', async () => {
    const client = new ShapeClient()
    const created = buildShape()
    board.createShape.mockResolvedValueOnce(created)

    const shapes: ShapeData[] = [
      {
        shape: 'triangle',
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        rotation: 15,
        text: 'Hello',
        style: {
          fillColor: '#123456',
          borderColor: 'nope',
          color: '#abcdef',
          borderWidth: -5,
          fillOpacity: 2,
          opacity: -1,
        },
      },
    ]

    const results = await client.createShapes(shapes)

    expect(board.createShape).toHaveBeenCalledTimes(1)
    expect(board.createShape).toHaveBeenCalledWith({
      shape: 'triangle',
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      rotation: 15,
      style: {
        fillColor: '#123456',
        color: '#abcdef',
        fillOpacity: 1,
        opacity: 0,
      },
      content: 'Hello',
    })
    expect(results).toEqual([created])
  })

  it('updates an existing shape and syncs when available', async () => {
    const syncMock = vi.fn(() => Promise.resolve())
    const target = buildShape({ sync: syncMock as unknown as Shape['sync'] })
    board.get.mockResolvedValueOnce([target])

    const client = new ShapeClient()
    await client.updateShape('shape-1', {
      shape: 'rectangle',
      x: 50,
      y: 75,
      width: 120,
      height: 80,
      rotation: 45,
      text: 'Updated',
      style: {
        fillColor: '#654321',
        borderColor: '#112233',
        borderWidth: 6,
        fillOpacity: 0.25,
        opacity: 0.5,
      },
    })

    expect(board.get).toHaveBeenCalledWith({ id: 'shape-1' })
    expect(target.x).toBe(50)
    expect(target.y).toBe(75)
    expect(Reflect.get(target, 'width')).toBe(120)
    expect(Reflect.get(target, 'height')).toBe(80)
    expect(target.rotation).toBe(45)
    expect(Reflect.get(target, 'text')).toBe('Updated')
    expect(target.style.fillColor).toBe('#654321')
    expect(target.style.borderWidth).toBe(6)
    expect(target.style.fillOpacity).toBeCloseTo(0.25)
    expect(Reflect.get(target, 'opacity')).toBe(0.5)
    expect(syncMock).toHaveBeenCalledTimes(1)
  })

  it('applies operations sequentially', async () => {
    const created = buildShape({ id: 'new' } as Partial<Shape>)
    const updateSync = vi.fn(() => Promise.resolve())
    const updateTarget = buildShape({ id: 'update', sync: updateSync as unknown as Shape['sync'] })
    type DeletableShape = Shape & { delete?: () => Promise<void> }
    const deleteMock = vi.fn(() => Promise.resolve())
    const deleteTarget = buildShape({ id: 'delete' }) as DeletableShape
    deleteTarget.delete = deleteMock

    board.createShape.mockResolvedValue(created)
    board.get.mockImplementation((query) => {
      if (query.id === 'update') {
        return Promise.resolve([updateTarget])
      }
      if (query.id === 'delete') {
        return Promise.resolve([deleteTarget])
      }
      return Promise.resolve([])
    })

    const client = new ShapeClient()
    await client.applyOperations([
      { op: 'create', data: { shape: 'rectangle', x: 1, y: 2, width: 3, height: 4 } },
      { op: 'update', id: 'update', data: { x: 10, y: 20, width: 30, height: 40 } },
      { op: 'delete', id: 'delete' },
    ])

    expect(board.createShape).toHaveBeenCalledTimes(1)
    expect(board.get).toHaveBeenCalledTimes(2)
    expect(updateTarget.x).toBe(10)
    expect(updateTarget.y).toBe(20)
    expect(Reflect.get(updateTarget, 'width')).toBe(30)
    expect(Reflect.get(updateTarget, 'height')).toBe(40)
    expect(updateSync).toHaveBeenCalledTimes(1)
    expect(deleteMock).toHaveBeenCalledTimes(1)
  })
})
