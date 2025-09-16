import { buildApp } from './app.js'
import { loadEnv } from './config/env.js'
import { changeQueue } from './queue/changeQueue.js'

/**
 * Start the Fastify server and background change queue.
 *
 * @param port Optional port override. Defaults to the `PORT` value from the environment.
 * @returns The Fastify instance once it has started listening.
 */
export async function startServer(port?: number) {
  const env = loadEnv()
  const app = await buildApp()
  changeQueue.start(env.QUEUE_CONCURRENCY)
  const listenPort = port ?? env.PORT
  await app.listen({ port: listenPort, host: '0.0.0.0' })
  app.log.info({ port: listenPort }, 'Server listening')
  return app
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
    .then((app) => {
      let shuttingDown = false
      const shutdown = async (signal: NodeJS.Signals) => {
        if (shuttingDown) return
        shuttingDown = true
        app.log.info({ signal }, 'Shutting down')
        try {
          await app.close()
          app.log.info('Server closed')
          process.exit(0)
        } catch (err) {
          app.log.error({ err }, 'Error during shutdown')
          process.exit(1)
        }
      }
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
