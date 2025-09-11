import type { FastifyPluginAsync } from 'fastify'

import { getMiro } from '../miro/miroClient.js'
import { errorResponse } from '../config/error-response.js'

export const registerAuthRoutes: FastifyPluginAsync = async (app) => {
  const loginHandler = async (
    _req: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
  ) => {
    // Optional: add state param for CSRF; using cookie session already
    const url = getMiro().getAuthUrl()
    return reply.redirect(url)
  }

  const callbackHandler = async (
    req: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
  ) => {
    const userId = req.userId
    const code = (req.query as Record<string, string> | undefined)?.code
    if (!code) {
      return reply.code(400).send(errorResponse('Missing code', 'MISSING_CODE'))
    }
    await getMiro().exchangeCodeForAccessToken(userId, code)
    return reply.redirect('/')
  }

  // Kick off OAuth flow
  app.get('/auth/miro/login', loginHandler)
  app.get('/oauth/login', loginHandler)

  // OAuth callback
  app.get('/auth/miro/callback', callbackHandler)
  app.get('/oauth/callback', callbackHandler)

  // Simple auth status endpoint for client
  app.get('/api/auth/status', async (req, reply) => {
    const userId = req.userId
    const authorized = await getMiro().isAuthorized(userId)
    return reply.send({ authorized })
  })
}
