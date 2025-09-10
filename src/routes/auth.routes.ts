import type { FastifyPluginAsync } from 'fastify'

import { getMiro } from '../miro/miroClient.js'

export const registerAuthRoutes: FastifyPluginAsync = async (app) => {
  // Kick off OAuth flow
  app.get('/auth/miro/login', async (_req, reply) => {
    // Optional: add state param for CSRF; using cookie session already
    const url = getMiro().getAuthUrl()
    reply.redirect(url)
  })

  // OAuth callback
  app.get('/auth/miro/callback', async (req, reply) => {
    const userId = (req as unknown as { userId?: string }).userId || ''
    const code = (req.query as Record<string, string> | undefined)?.code
    if (!code) {
      return reply.code(400).send({ error: 'Missing code' })
    }
    await getMiro().exchangeCodeForAccessToken(userId, code)
    reply.redirect('/')
  })

  // Simple auth status endpoint for client
  app.get('/api/auth/status', async (req, reply) => {
    const userId = (req as unknown as { userId?: string }).userId || ''
    const authorized = await getMiro().isAuthorized(userId)
    return reply.send({ authorized })
  })
}
