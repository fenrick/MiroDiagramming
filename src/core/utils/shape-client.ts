import type { Shape, ShapeStyle, ShapeType } from '@mirohq/websdk-types'

export interface ShapeData {
  shape: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  text?: string
  style?: Record<string, unknown>
}

export type ShapeOperation =
  | { op: 'create'; data: Record<string, unknown> }
  | { op: 'update'; id: string; data: Record<string, unknown> }
  | { op: 'delete'; id: string }

interface BoardShapeApi {
  createShape: (properties?: Record<string, unknown>) => Promise<Shape>
  get: (query: { id?: string; type?: string }) => Promise<unknown[]>
}

type SanitizedStyle = Partial<ShapeStyle> & { opacity?: number }

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function coerceNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

function withColor(value: unknown, apply: (color: string) => void): void {
  if (typeof value === 'string' && HEX_COLOR.test(value)) {
    apply(value)
  }
}

function withFiniteNumber(value: unknown, apply: (numberValue: number) => void): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    apply(value)
  }
}

function withNonNegativeNumber(value: unknown, apply: (numberValue: number) => void): void {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    apply(value)
  }
}

function ensureBoard(): BoardShapeApi {
  const miroCandidate = (globalThis as typeof globalThis & { miro?: unknown }).miro
  if (!isRecord(miroCandidate)) {
    throw new TypeError('Miro board API not available')
  }
  const boardCandidate = (miroCandidate as { board?: unknown }).board
  if (!isRecord(boardCandidate)) {
    throw new TypeError('Miro board API not available')
  }
  const { createShape, get } = boardCandidate as Partial<BoardShapeApi>
  if (typeof createShape !== 'function' || typeof get !== 'function') {
    throw new TypeError('Miro board API not available')
  }
  return {
    createShape(properties) {
      return createShape.call(boardCandidate, properties)
    },
    get(query) {
      return get.call(boardCandidate, query)
    },
  }
}

function toShapeData(raw: Record<string, unknown>): ShapeData {
  const source = raw as Partial<ShapeData>
  return {
    shape: typeof source.shape === 'string' ? source.shape : 'rectangle',
    x: coerceNumber(source.x, 0),
    y: coerceNumber(source.y, 0),
    width: coerceNumber(source.width, 100),
    height: coerceNumber(source.height, 100),
    rotation:
      typeof source.rotation === 'number' && Number.isFinite(source.rotation)
        ? source.rotation
        : undefined,
    text: typeof source.text === 'string' ? source.text : undefined,
    style: isRecord(source.style) ? source.style : undefined,
  }
}

function sanitizeStyle(style: Record<string, unknown>): SanitizedStyle {
  const typed = style as Partial<ShapeStyle> & { opacity?: unknown }
  const sanitized: SanitizedStyle = {}

  withColor(typed.fillColor, (color) => {
    sanitized.fillColor = color
  })

  withColor(typed.borderColor, (color) => {
    sanitized.borderColor = color
  })

  withColor(typed.color, (color) => {
    sanitized.color = color
  })

  withNonNegativeNumber(typed.borderWidth, (width) => {
    sanitized.borderWidth = width
  })

  withFiniteNumber(typed.fillOpacity, (opacity) => {
    sanitized.fillOpacity = clamp01(opacity)
  })

  withFiniteNumber(typed.opacity, (opacity) => {
    sanitized.opacity = clamp01(opacity)
  })

  return sanitized
}

function applyShapeData(target: Shape, data: ShapeData): void {
  target.x = data.x
  target.y = data.y
  Reflect.set(target, 'width', data.width)
  Reflect.set(target, 'height', data.height)
  if (typeof data.rotation === 'number') {
    target.rotation = data.rotation
  }
  if (data.style) {
    const sanitized = sanitizeStyle(data.style)
    const { opacity, ...style } = sanitized
    target.style = {
      ...target.style,
      ...style,
    } as ShapeStyle
    if (typeof opacity === 'number') {
      Reflect.set(target, 'opacity', opacity)
    }
  }
  if (typeof data.text === 'string') {
    Reflect.set(target, 'content', data.text)
    Reflect.set(target, 'text', data.text)
  }
  if (typeof data.shape === 'string') {
    Reflect.set(target, 'shape', data.shape as ShapeType)
  }
}

function isShape(candidate: unknown): candidate is Shape {
  return (
    isRecord(candidate) &&
    (candidate as { type?: unknown }).type === 'shape' &&
    'style' in candidate
  )
}

async function fetchShape(id: string): Promise<Shape | undefined> {
  const board = ensureBoard()
  const [item] = await board.get({ id })
  if (!isShape(item)) {
    return undefined
  }
  return item
}

/** Minimal utility for manipulating shapes via the Miro Web SDK. */
export class ShapeClient {
  public constructor() {
    // Explicit constructor kept for future dependency injection
    // and to satisfy lint by including a statement.
    void 0
  }

  /** Create a single shape widget. */
  public async createShape(shape: ShapeData): Promise<Shape | undefined> {
    const [created] = await this.createShapes([shape])
    return created
  }

  /** Create multiple shapes and return their widget representations. */
  public async createShapes(shapes: ShapeData[]): Promise<Shape[]> {
    if (shapes.length === 0) {
      return []
    }
    const board = ensureBoard()
    const created = await Promise.all(
      shapes.map((shape) =>
        board.createShape({
          shape: shape.shape,
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation,
          style: shape.style ? sanitizeStyle(shape.style) : undefined,
          content: shape.text,
        }),
      ),
    )
    return created
  }

  /** Update an existing shape if found. */
  public async updateShape(id: string, shape: ShapeData): Promise<void> {
    const target = await fetchShape(id)
    if (!target) {
      return
    }
    applyShapeData(target, shape)
    if (typeof target.sync === 'function') {
      await target.sync()
    }
  }

  /** Delete a shape widget from the board. */
  public async deleteShape(id: string): Promise<void> {
    const target = await fetchShape(id)
    if (!target) {
      return
    }
    const deleteFunction = (target as { delete?: () => Promise<void> }).delete
    if (typeof deleteFunction === 'function') {
      await deleteFunction.call(target)
    }
  }

  /** Retrieve a shape widget by identifier. */
  public async getShape(id: string): Promise<Shape | undefined> {
    return fetchShape(id)
  }

  /** Apply a series of shape mutations sequentially. */
  public async applyOperations(ops: readonly ShapeOperation[]): Promise<void> {
    for (const op of ops) {
      switch (op.op) {
        case 'create': {
          await this.createShape(toShapeData(op.data))

          break
        }
        case 'update': {
          await this.updateShape(op.id, toShapeData(op.data))

          break
        }
        case 'delete': {
          await this.deleteShape(op.id)

          break
        }
        // No default
      }
    }
  }
}
