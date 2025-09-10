import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

import { changeQueue, createNodeTask } from '../queue/changeQueue.js'
import { IdempotencyRepo } from '../repositories/idempotencyRepo.js'

const CardCreate = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  style: z.record(z.unknown()).optional(),
  fields: z.array(z.record(z.unknown())).optional(),
  taskStatus: z.string().optional(),
  boardId: z.string().optional(),
})

export const registerCardsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/cards', async (req, reply) => {
    const userId = (req as unknown as { userId?: string }).userId || ''
    const body = req.body
    const parsed = z.array(CardCreate).safeParse(body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload' })
    }
    const headers = (req.headers || {}) as Record<string, string | undefined>
    const idemKey = headers['idempotency-key'] || headers['Idempotency-Key']
    const repo = new IdempotencyRepo()
    if (idemKey) {
      const previous = await repo.get(idemKey)
      if (previous !== undefined) {
        return reply.code(202).send({ accepted: previous })
      }
    }
    const cards = parsed.data
    for (const c of cards) {
      const nodeId = c.id ?? Math.random().toString(36).slice(2)
      const data: Record<string, unknown> = { ...c }
      delete (data as Record<string, unknown>).id
      changeQueue.enqueue(createNodeTask(userId, nodeId, data))
    }
    const accepted = cards.length
    if (idemKey) await repo.set(idemKey, accepted)
    return reply.code(202).send({ accepted })
  })
}
