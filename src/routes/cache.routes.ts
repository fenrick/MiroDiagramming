import type { FastifyPluginAsync } from 'fastify'

import { getPrisma } from '../config/db.js'

export const registerCacheRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/cache/:boardId', async (req, reply) => {
    const prisma = getPrisma()
    const key = (req.params as { boardId: string }).boardId
    const row = await prisma.cacheEntry.findUnique({ where: { key } })
    if (!row) return reply.send({})
    try {
      const json = JSON.parse(row.value)
      return reply.send(json)
    } catch {
      // return raw string if not JSON
      return reply.send({ value: row.value })
    }
  })
}

