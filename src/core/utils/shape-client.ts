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

function ensureBoard(): {
  createShape: (properties?: Record<string, unknown>) => Promise<Shape>
  get: (query: { id?: string; type?: string }) => Promise<unknown[]>
} {
  const board = globalThis.miro?.board
  if (!board || typeof board.createShape !== 'function' || typeof board.get !== 'function') {
    throw new Error('Miro board API not available')
  }
  return {
    createShape: board.createShape.bind(board),
    get: board.get.bind(board),
  }
}

function toShapeData(raw: Record<string, unknown>): ShapeData {
  const style =
    typeof raw.style === 'object' && raw.style !== null
      ? (raw.style as Record<string, unknown>)
      : undefined
  return {
    shape: typeof raw.shape === 'string' ? raw.shape : 'rectangle',
    x: typeof raw.x === 'number' ? raw.x : Number(raw.x ?? 0),
    y: typeof raw.y === 'number' ? raw.y : Number(raw.y ?? 0),
    width: typeof raw.width === 'number' ? raw.width : Number(raw.width ?? 100),
    height: typeof raw.height === 'number' ? raw.height : Number(raw.height ?? 100),
    rotation: typeof raw.rotation === 'number' ? raw.rotation : undefined,
    text: typeof raw.text === 'string' ? raw.text : undefined,
    style,
  }
}

function applyShapeData(target: Shape, data: ShapeData): void {
  target.x = data.x
  target.y = data.y
  Reflect.set(target, 'width', data.width)
  Reflect.set(target, 'height', data.height)
  target.rotation = data.rotation ?? target.rotation
  if (data.style) {
    target.style = {
      ...(target.style ?? ({} as Partial<ShapeStyle>)),
      ...sanitizeStyle(data.style),
    } as ShapeStyle
  }
  if (typeof data.text === 'string') {
    Reflect.set(target, 'content', data.text)
    Reflect.set(target, 'text', data.text)
  }
  if (typeof data.shape === 'string') {
    Reflect.set(target, 'shape', data.shape as ShapeType)
  }
}

function sanitizeStyle(style: Record<string, unknown>): Partial<ShapeStyle> {
  const out: Partial<ShapeStyle> = {}
  const hex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
  // fill color
  const fill = (style as { fillColor?: unknown }).fillColor
  if (typeof fill === 'string' && hex.test(fill)) {
    out.fillColor = fill
  }
  // border color
  const border = (style as { borderColor?: unknown }).borderColor
  if (typeof border === 'string' && hex.test(border)) {
    ;(out as Record<string, unknown>).borderColor = border
  }
  // border width
  const bw = (style as { borderWidth?: unknown }).borderWidth
  if (typeof bw === 'number' && Number.isFinite(bw) && bw >= 0) {
    ;(out as Record<string, unknown>).borderWidth = bw
  }
  // text color
  const color = (style as { color?: unknown }).color
  if (typeof color === 'string' && hex.test(color)) {
    ;(out as Record<string, unknown>).color = color
  }
  // pass through known numeric opacities
  const fillOpacity = (style as { fillOpacity?: unknown }).fillOpacity
  if (typeof fillOpacity === 'number') {
    ;(out as Record<string, unknown>).fillOpacity = Math.max(0, Math.min(1, fillOpacity))
  }
  const opacity = (style as { opacity?: unknown }).opacity
  if (typeof opacity === 'number') {
    ;(out as Record<string, unknown>).opacity = Math.max(0, Math.min(1, opacity))
  }
  return out
}

async function fetchShape(id: string): Promise<Shape | undefined> {
  const board = ensureBoard()
  const [item] = (await board.get({ id })) as Shape[]
  if (!item || item.type !== 'shape') {
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
    await target.sync?.()
  }

  /** Delete a shape widget from the board. */
  public async deleteShape(id: string): Promise<void> {
    const target = await fetchShape(id)
    await (target as { delete?: () => Promise<void> }).delete?.()
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
          if (!op.id) {
            continue
          }
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
