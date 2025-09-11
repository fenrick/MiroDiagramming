import { randomUUID } from 'node:crypto'

import type { FastifyPluginAsync } from 'fastify'

import { changeQueue, createNodeTask } from '../queue/changeQueue.js'
import { IdempotencyRepo } from '../repositories/idempotencyRepo.js'
import { getIdempotencyKey } from '../utils/headers.js'

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
  additionalProperties: false,
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
    /**
     * Accepts an array of card definitions and enqueues creation tasks.
     * Only whitelisted fields are forwarded. Idempotency is enforced via
     * the `Idempotency-Key` header which returns the same accepted count on
     * retries.
     */
    async (req, reply) => {
      const userId = req.userId
      const cards = req.body
      const idemKey = getIdempotencyKey(req)

      if (!Array.isArray(cards) || cards.length === 0) {
        if (idemKey) {
          const repo = new IdempotencyRepo()
          await repo.set(idemKey, 0)
        }
        return reply.code(202).send({ accepted: 0 })
      }

      const repo = idemKey ? new IdempotencyRepo() : undefined

      if (idemKey && repo) {
        const previous = await repo.get(idemKey)
        if (typeof previous === 'number') {
          return reply.code(202).send({ accepted: previous })
        }
      }

      for (const c of cards) {
        const nodeId = c.id ?? randomUUID()
        const { title, description, tags, style, fields, taskStatus, boardId } = c
        const data: Record<string, unknown> = {
          title,
          description,
          tags,
          style,
          fields,
          taskStatus,
          boardId,
        }
        // Remove undefined keys
        Object.keys(data).forEach((k) => (data[k] === undefined ? delete data[k] : undefined))
        changeQueue.enqueue(createNodeTask(userId, nodeId, data))
      }
      const accepted = cards.length
      if (idemKey && repo) await repo.set(idemKey, accepted)
      return reply.code(202).send({ accepted })
    },
  )
}
