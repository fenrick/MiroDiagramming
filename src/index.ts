import { DiagramApp } from './app/diagram-app'
import * as log from './logger'

async function start(): Promise<void> {
  log.info('Starting application')
  await DiagramApp.getInstance().init()
}

start().catch((err) => log.error(err))

export {}
