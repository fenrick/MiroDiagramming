import { DiagramApp } from './app/diagram-app'
import * as log from './logger'
import { registerWithCurrentUser } from './user-auth'

async function start(): Promise<void> {
  log.info('Starting application')
  await registerWithCurrentUser()
  await DiagramApp.getInstance().init()
}

start().catch((err) => log.error(err))

export {}
