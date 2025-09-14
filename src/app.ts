import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyStatic from '@fastify/static'
import fastifyCors from '@fastify/cors'
import fastifyRawBody from 'fastify-raw-body'
import type {} from '@fastify/static'

import { loadEnv } from './config/env.js'
import { getLoggerOptions } from './config/logger.js'
import { registerErrorHandler } from './config/error-handler.js'
import { getPrisma } from './config/db.js'
import { changeQueue } from './queue/changeQueue.js'
import { registerAuthRoutes } from './routes/auth.routes.js'
import { registerCardsRoutes } from './routes/cards.routes.js'
import { registerTagsRoutes } from './routes/tags.routes.js'
import { registerBoardsRoutes } from './routes/boards.routes.js'
import { registerCacheRoutes } from './routes/cache.routes.js'
import { registerLimitsRoutes } from './routes/limits.routes.js'
import { registerWebhookRoutes } from './routes/webhook.routes.js'
import { IdempotencyRepo } from './repositories/idempotencyRepo.js'
import { registerSpaFallback } from './utils/spaFallback.js'

/**
 * Compose and configure the Fastify application.
 *
 * Registers core plugins, API routes and queue handlers while wiring up
 * lightweight request state via cookies. In production the pre-built React
 * frontend is served and a SPA fallback ensures client-side routing works
 * for deep links.
 */
export async function buildApp() {
  const env = loadEnv()
  const app = Fastify({ logger: getLoggerOptions(), genReqId: () => randomUUID() })
  registerErrorHandler(app)
  // Cookie-based lightweight session to associate a userId used for Miro OAuth.
  // The cookie is not an auth session; it only scopes Miro tokens per visitor.
  await app.register(fastifyCookie, {
    secret: env.SESSION_SECRET,
    parseOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    },
  })
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGINS ?? false,
    credentials: true,
  })
  // Register raw-body plugin (disabled by default; enable per-route)
  await app.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  })

  // Simple userId cookie for session affinity (used later for Miro OAuth)
  // Ensure every request has a stable userId cookie set; used to scope Miro tokens.
  app.addHook('preHandler', async (request, reply) => {
    const cookies = (request as { cookies?: Record<string, string> }).cookies
    let userId = cookies?.userId
    if (!userId) {
      userId = randomUUID()
      reply.setCookie('userId', userId, { path: '/' })
    }
    request.userId = userId
  })

  app.get('/healthz', async () => ({ status: 'ok' }))

  app.get('/readyz', async (request, reply) => {
    try {
      await getPrisma().$queryRaw`SELECT 1`
    } catch {
      return reply.code(503).send({ status: 'error', reason: 'db' })
    }
    if (changeQueue.size() > 0 || changeQueue.inFlight() > 0) {
      return reply.code(503).send({ status: 'error', reason: 'queue' })
    }
    return { status: 'ok' }
  })

  // Root route can be used for a quick sanity check
  app.get('/api', async () => ({ name: 'miro-server', ok: true }))

  await app.register(registerAuthRoutes)
  await app.register(registerCardsRoutes)
  await app.register(registerTagsRoutes)
  await app.register(registerBoardsRoutes)
  await app.register(registerCacheRoutes)
  await app.register(registerLimitsRoutes)
  await app.register(registerWebhookRoutes)

  const idempotencyRepo = new IdempotencyRepo()
  const cleanupInterval = env.MIRO_IDEMPOTENCY_CLEANUP_SECONDS * 1000
  const cleanupTimer = setInterval(async () => {
    try {
      await idempotencyRepo.cleanup(env.MIRO_IDEMPOTENCY_CLEANUP_SECONDS)
    } catch (err) {
      app.log.error({ err }, 'idempotency cleanup failed')
    }
  }, cleanupInterval)
  cleanupTimer.unref()

  // In production, serve the built frontend and fall back to index.html so
  // arbitrary paths resolve to the SPA entrypoint.
  if (process.env.NODE_ENV === 'production') {
    try {
      const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/web/dist')
      await app.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
      })

      registerSpaFallback(app, (_req, reply) => reply.sendFile('index.html'))
    } catch {
      // Ignore if dist path is missing (dev/test mode)
    }
  }

  // Gracefully close Prisma on server shutdown
  app.addHook('onClose', async () => {
    try {
      await getPrisma().$disconnect()
    } catch {
      // ignore
    }
    try {
      changeQueue.stop()
    } catch {
      // ignore
    }
    clearInterval(cleanupTimer)
  })

  // In development (but not tests), attach Vite middleware for a single-process dev
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const { registerDevVite } = await import('./config/dev-vite')
    await registerDevVite(app)
  }

  // Configure queue logging and tuning from env
  changeQueue.setLogger(app.log)
  changeQueue.configure({
    concurrency: env.QUEUE_CONCURRENCY,
    baseDelayMs: env.QUEUE_BASE_DELAY_MS,
    maxDelayMs: env.QUEUE_MAX_DELAY_MS,
    maxRetries: env.QUEUE_MAX_RETRIES,
  })

  return app
}
