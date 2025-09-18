import './assets/style.css'

import * as log from './logger'
import { DiagramApp } from './app/diagram-app'

async function init(): Promise<void> {
  try {
    log.info('Entry page loaded; registering Miro UI handlers')
    await DiagramApp.getInstance().init()
  } catch (err) {
    log.error(err instanceof Error ? err.message : String(err))
  }
}

void init()
