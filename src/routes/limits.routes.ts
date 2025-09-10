import type { FastifyPluginAsync } from 'fastify'

import { changeQueue } from '../queue/changeQueue.js'

export const registerLimitsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/limits', async (_req, reply) => {
    // We currently expose queue length and a stubbed bucket_fill structure.
    const queue_length = changeQueue.size()
    const in_flight = changeQueue.inFlight()
    const bucket_fill: Record<string, number> = {}
    return reply.send({ queue_length, in_flight, bucket_fill })
  })
}
