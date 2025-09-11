import type { FastifyPluginAsync } from 'fastify'

import { getMiro } from '../miro/miroClient.js'
import { errorResponse } from '../config/error-response.js'

export const registerAuthRoutes: FastifyPluginAsync = async (app) => {
  const redirectToLogin = (reply: import('fastify').FastifyReply) =>
    reply.redirect('/auth/miro/login')
  const handleCallback = async (
    userId: string,
    code: string | undefined,
    reply: import('fastify').FastifyReply,
  ) => {
    if (!code) {
      return reply.code(400).send(errorResponse('Missing code', 'MISSING_CODE'))
    }
    await getMiro().exchangeCodeForAccessToken(userId, code)
    return reply.redirect('/')
  }

  // Kick off OAuth flow
  app.get('/auth/miro/login', async (_req, reply) => {
    // Optional: add state param for CSRF; using cookie session already
    const url = getMiro().getAuthUrl()
    reply.redirect(url)
  })

  // Back-compat aliases expected by the client
  app.get('/oauth/login', async (_req, reply) => {
    return redirectToLogin(reply)
  })

  // OAuth callback
  app.get('/auth/miro/callback', async (req, reply) => {
    const userId = req.userId || ''
    const code = (req.query as Record<string, string> | undefined)?.code
    return handleCallback(userId, code, reply)
  })

  app.get('/oauth/callback', async (req, reply) => {
    const userId = req.userId || ''
    const code = (req.query as Record<string, string> | undefined)?.code
    return handleCallback(userId, code, reply)
  })

  // Simple auth status endpoint for client
  app.get('/api/auth/status', async (req, reply) => {
    const userId = req.userId || ''
    const authorized = await getMiro().isAuthorized(userId)
    return reply.send({ authorized })
  })
}
