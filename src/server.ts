import { buildApp } from './app.js'
import { loadEnv } from './config/env.js'
import { changeQueue } from './queue/changeQueue.js'
import { registerGracefulShutdown } from './server/shutdown.js'

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
      registerGracefulShutdown(app)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
