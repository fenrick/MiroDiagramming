import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { FastifyInstance } from 'fastify'
import type {} from '@fastify/middie'

import { registerSpaFallback } from '../utils/spaFallback'

/**
 * Attach Vite middleware for local development.
 *
 * Lazily imports `@fastify/middie` and Vite so they are excluded from the
 * production runtime. Serves the React frontend and wires the SPA fallback.
 */
export async function registerDevVite(app: FastifyInstance) {
  const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../web')
  const [{ default: middie }, { createServer }] = await Promise.all([
    import('@fastify/middie'),
    import('vite'),
  ])
  await app.register(middie)
  const vite = await createServer({
    root: clientRoot,
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)

  registerSpaFallback(app, async (req, reply) => {
    const url = req.url || '/'
    const indexPath = path.resolve(clientRoot, 'index.html')
    let html = await fs.readFile(indexPath, 'utf-8')
    html = await vite.transformIndexHtml(url, html)
    reply.type('text/html').send(html)
  })
}
