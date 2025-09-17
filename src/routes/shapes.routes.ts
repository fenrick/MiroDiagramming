import type { FastifyPluginAsync } from 'fastify'

import { getMiro } from '../miro/miroClient.js'
import { withMiroRetry } from '../miro/retry.js'

interface ShapePayload {
  shape: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  text?: string
  style?: Record<string, unknown>
}

function ensureNumber(value: number | undefined, fallback?: number): number | undefined {
  if (typeof value !== 'number') {
    return fallback
  }
  if (!Number.isFinite(value)) {
    return fallback
  }
  return value
}

function buildPosition(shape: ShapePayload) {
  return {
    x: ensureNumber(shape.x, 0) ?? 0,
    y: ensureNumber(shape.y, 0) ?? 0,
  }
}

function buildGeometry(shape: ShapePayload) {
  const rotation = ensureNumber(shape.rotation, 0)
  const width = ensureNumber(shape.width)
  const height = ensureNumber(shape.height)
  const geometry: Record<string, number> = {}
  if (typeof width === 'number') {
    geometry.width = width
  }
  if (typeof height === 'number') {
    geometry.height = height
  }
  if (typeof rotation === 'number') {
    geometry.rotation = rotation
  }
  return geometry
}

function buildTextGeometry(shape: ShapePayload) {
  const geometry: Record<string, number> = {}
  const width = ensureNumber(shape.width)
  const rotation = ensureNumber(shape.rotation)
  if (typeof width === 'number') {
    geometry.width = width
  }
  if (typeof rotation === 'number') {
    geometry.rotation = rotation
  }
  return geometry
}

function pickStyle(shape: ShapePayload) {
  if (!shape.style) {
    return undefined
  }
  return shape.style
}

function ensureRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return {}
}

async function createShapeItem(
  userId: string,
  boardId: string,
  payload: ShapePayload,
): Promise<Record<string, unknown>> {
  const client = getMiro().as(userId)
  if (payload.shape === 'text') {
    const body = await withMiroRetry(() =>
      client._api.createTextItem(boardId, {
        data: { content: payload.text ?? '' },
        style: pickStyle(payload),
        position: buildPosition(payload),
        geometry: buildTextGeometry(payload),
      }),
    )
    return ensureRecord(body.body)
  }
  const body = await withMiroRetry(() =>
    client._api.createShapeItem(boardId, {
      data: { shape: payload.shape, content: payload.text ?? '' },
      style: pickStyle(payload),
      position: buildPosition(payload),
      geometry: buildGeometry(payload),
    }),
  )
  return ensureRecord(body.body)
}

async function updateShapeItem(
  userId: string,
  boardId: string,
  shapeId: string,
  payload: ShapePayload,
): Promise<Record<string, unknown>> {
  const client = getMiro().as(userId)
  if (payload.shape === 'text') {
    const body = await withMiroRetry(() =>
      client._api.updateTextItem(boardId, shapeId, {
        data: { content: payload.text ?? '' },
        style: pickStyle(payload),
        position: buildPosition(payload),
        geometry: buildTextGeometry(payload),
      }),
    )
    return ensureRecord(body.body)
  }
  const body = await withMiroRetry(() =>
    client._api.updateShapeItem(boardId, shapeId, {
      data: { shape: payload.shape, content: payload.text ?? '' },
      style: pickStyle(payload),
      position: buildPosition(payload),
      geometry: buildGeometry(payload),
    }),
  )
  return ensureRecord(body.body)
}

async function deleteShapeItem(userId: string, boardId: string, shapeId: string): Promise<void> {
  const client = getMiro().as(userId)
  const item = await withMiroRetry(() => client._api.getSpecificItem(boardId, shapeId))
  const type = (item.body as { type?: string }).type
  if (type === 'text') {
    await withMiroRetry(() => client._api.deleteTextItem(boardId, shapeId))
    return
  }
  await withMiroRetry(() => client._api.deleteShapeItem(boardId, shapeId))
}

async function getShapeItem(
  userId: string,
  boardId: string,
  shapeId: string,
): Promise<Record<string, unknown>> {
  const client = getMiro().as(userId)
  const item = await withMiroRetry(() => client._api.getSpecificItem(boardId, shapeId))
  return ensureRecord(item.body)
}

export const registerShapesRoutes: FastifyPluginAsync = async (app) => {
  const shapeSchema = {
    type: 'object',
    required: ['shape', 'x', 'y', 'width', 'height'],
    properties: {
      shape: { type: 'string' },
      x: { type: 'number' },
      y: { type: 'number' },
      width: { type: 'number' },
      height: { type: 'number' },
      rotation: { type: 'number' },
      text: { type: 'string' },
      style: { type: 'object' },
    },
    additionalProperties: true,
  } as const

  app.get<{ Params: { boardId: string }; Querystring: { since?: string } }>(
    '/api/boards/:boardId/shapes',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId'],
          properties: { boardId: { type: 'string' } },
        },
        querystring: {
          type: 'object',
          properties: {
            since: {
              type: 'string',
              pattern: '^[0-9]+$',
              description: 'Optional sync token representing the last-known version.',
            },
          },
        },
      },
    },
    async (_req, reply) => {
      return reply.send({ shapes: [], version: Date.now() })
    },
  )

  app.post<{ Params: { boardId: string }; Body: ShapePayload[] }>(
    '/api/boards/:boardId/shapes',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId'],
          properties: { boardId: { type: 'string' } },
        },
        body: {
          type: 'array',
          items: shapeSchema,
          minItems: 1,
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: { body: { type: 'string' } },
              required: ['body'],
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { boardId } = req.params
      const userId = req.userId
      const results: Array<Record<string, unknown>> = []
      for (const shape of req.body ?? []) {
        const result = await createShapeItem(userId, boardId, shape)
        results.push(result)
      }
      const payload = results.map((r) => ({ body: JSON.stringify(r) }))
      return reply.send(payload)
    },
  )

  app.get<{ Params: { boardId: string; shapeId: string } }>(
    '/api/boards/:boardId/shapes/:shapeId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId', 'shapeId'],
          properties: { boardId: { type: 'string' }, shapeId: { type: 'string' } },
        },
      },
    },
    async (req, reply) => {
      const item = await getShapeItem(req.userId, req.params.boardId, req.params.shapeId)
      return reply.send(item)
    },
  )

  app.put<{ Params: { boardId: string; shapeId: string }; Body: ShapePayload }>(
    '/api/boards/:boardId/shapes/:shapeId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId', 'shapeId'],
          properties: { boardId: { type: 'string' }, shapeId: { type: 'string' } },
        },
        body: shapeSchema,
      },
    },
    async (req, reply) => {
      const { boardId, shapeId } = req.params
      const updated = await updateShapeItem(req.userId, boardId, shapeId, req.body)
      return reply.send(updated)
    },
  )

  app.delete<{ Params: { boardId: string; shapeId: string } }>(
    '/api/boards/:boardId/shapes/:shapeId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId', 'shapeId'],
          properties: { boardId: { type: 'string' }, shapeId: { type: 'string' } },
        },
      },
    },
    async (req, reply) => {
      await deleteShapeItem(req.userId, req.params.boardId, req.params.shapeId)
      return reply.status(204).send()
    },
  )

  app.post<{ Params: { boardId: string } }>(
    '/api/boards/:boardId/shapes/refresh',
    {
      schema: {
        params: {
          type: 'object',
          required: ['boardId'],
          properties: { boardId: { type: 'string' } },
        },
      },
    },
    async (_req, reply) => reply.code(202).send({ status: 'accepted' }),
  )
}

export default registerShapesRoutes
