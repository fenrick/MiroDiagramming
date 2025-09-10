import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyStatic from '@fastify/static'

import { loadEnv } from './config/env.js'
import { createLogger } from './config/logger.js'

export async function buildApp() {
  const env = loadEnv()
  const logger = createLogger()
  const app = Fastify({ logger })

  await app.register(fastifyCookie)

  // Simple userId cookie for session affinity (used later for Miro OAuth)
  app.addHook('preHandler', async (request: FastifyRequest & { userId?: string }, reply: FastifyReply) => {
    const cookies = (request as unknown as { cookies?: Record<string, string> }).cookies
    let userId = cookies?.userId
    if (!userId) {
      userId = Math.random().toString(36).slice(2)
      reply.setCookie('userId', userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        path: '/',
      })
    }
    request.userId = userId
  })

  app.get('/healthz', async () => ({ status: 'ok' }))

  // Root route can be used for a quick sanity check
  app.get('/api', async () => ({ name: 'miro-server', ok: true }))

  // In production, serve the built frontend from web/client/dist
  if (process.env.NODE_ENV === 'production') {
    try {
      const distPath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../web/client/dist',
      )
      await app.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
      })

      // SPA fallback to index.html for non-API routes
      app.setNotFoundHandler((req, reply) => {
        const url = req.url || ''
        if (url.startsWith('/api')) {
          return reply.code(404).send({ error: 'Not found' })
        }
        // Serve index.html for client-side routing
        return (reply as unknown as { sendFile: (p: string) => FastifyReply }).sendFile('index.html')
      })
    } catch {
      // Ignore if dist path is missing (dev/test mode)
    }
  }

  // In development (but not tests), attach Vite middleware for a single-process dev
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/client')
    // Lazy import to avoid adding Vite to production runtime
    const [{ default: middie }, { createServer }] = await Promise.all([
      import('@fastify/middie'),
      import('vite'),
    ])
    await app.register(middie)
    const vite = await createServer({ root: clientRoot, server: { middlewareMode: true }, appType: 'custom' })
    ;(app as unknown as { use: (m: unknown) => void }).use(vite.middlewares)

    // Fallback index.html for SPA routes, excluding API and health
    app.all('*', async (req, reply) => {
      const url = req.url || '/'
      if (url.startsWith('/api') || url.startsWith('/healthz')) {
        return reply.code(404).send({ error: 'Not found' })
      }
      const indexPath = path.resolve(clientRoot, 'index.html')
      let html = await fs.readFile(indexPath, 'utf-8')
      html = await vite.transformIndexHtml(url, html)
      reply.type('text/html').send(html)
    })
  }

  return app
}
