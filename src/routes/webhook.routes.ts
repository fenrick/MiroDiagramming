import type { FastifyPluginAsync } from 'fastify'

export const registerWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/webhook', async (_req, reply) => {
    // TODO: verify signature and enqueue processing
    return reply.code(202).send({ accepted: true })
  })
}

