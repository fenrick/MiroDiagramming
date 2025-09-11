import type { FastifyPluginAsync } from 'fastify'

import { changeQueue, createNodeTask } from '../queue/changeQueue.js'
import { IdempotencyRepo } from '../repositories/idempotencyRepo.js'

interface CardCreate {
  id?: string
  title: string
  description?: string
  tags?: string[]
  style?: Record<string, unknown>
  fields?: Array<Record<string, unknown>>
  taskStatus?: string
  boardId?: string
}

const cardCreateSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    style: { type: 'object', additionalProperties: true },
    fields: { type: 'array', items: { type: 'object', additionalProperties: true } },
    taskStatus: { type: 'string' },
    boardId: { type: 'string' },
  },
  required: ['title'],
  additionalProperties: true,
} as const

export const registerCardsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CardCreate[] }>(
    '/api/cards',
    {
      schema: {
        body: { type: 'array', items: cardCreateSchema },
        response: {
          202: {
            type: 'object',
            properties: { accepted: { type: 'number' } },
            required: ['accepted'],
          },
        },
      },
    },
    async (req, reply) => {
      const userId = req.userId || ''
      const cards = req.body
      const headers = (req.headers || {}) as Record<string, string | undefined>
      const idemKey = headers['idempotency-key'] || headers['Idempotency-Key']
      const repo = new IdempotencyRepo()
      if (idemKey) {
        const previous = await repo.get(idemKey)
        if (previous !== undefined) {
          return reply.code(202).send({ accepted: previous })
        }
      }
      for (const c of cards) {
        const nodeId = c.id ?? Math.random().toString(36).slice(2)
        const data: Record<string, unknown> = { ...c }
        delete (data as Record<string, unknown>).id
        changeQueue.enqueue(createNodeTask(userId, nodeId, data))
      }
      const accepted = cards.length
      if (idemKey) await repo.set(idemKey, accepted)
      return reply.code(202).send({ accepted })
    },
  )
}
