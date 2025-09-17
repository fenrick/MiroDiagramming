import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { NotFoundError } from '../config/domain-errors.js'

/**
 * Registers a catch-all SPA fallback serving `index.html` for non-API routes.
 *
 * @param app Fastify instance to attach the handler to
 * @param serveIndex Function that sends the rendered `index.html`
 */
export function registerSpaFallback(
  app: FastifyInstance,
  serveIndex: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown,
) {
  app.setNotFoundHandler((req, reply) => {
    const url = req.url || ''
    if (url.startsWith('/api') || url.startsWith('/healthz')) {
      throw new NotFoundError('Not found', 'NOT_FOUND')
    }
    return serveIndex(req, reply)
  })
}
