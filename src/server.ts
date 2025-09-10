import { buildApp } from './app.js'
import { loadEnv } from './config/env.js'
import { changeQueue } from './queue/changeQueue.js'

async function main() {
  const env = loadEnv()
  const app = await buildApp()
  changeQueue.start()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
