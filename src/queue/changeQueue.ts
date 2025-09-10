import { setTimeout as delay } from 'node:timers/promises'

import { MiroService } from '../services/miroService.js'
import { createLogger } from '../config/logger.js'

import { createNodeTask, type ChangeTask } from './types.js'

const logger = createLogger()

class InMemoryQueue {
  private q: ChangeTask[] = []
  private running = false
  private miro = new MiroService()

  enqueue(task: ChangeTask) {
    this.q.push(task)
  }

  size() {
    return this.q.length
  }

  start() {
    if (this.running) return
    this.running = true
    void this.loop()
  }

  private async loop() {
    while (this.running) {
      const task = this.q.shift()
      if (!task) {
        await delay(50)
        continue
      }
      try {
        const started = Date.now()
        if (task.type === 'create_node') {
          await this.miro.createNode(task.userId, task.nodeId, task.data)
        }
        const dur = Date.now() - started
        logger.info({ msg: 'task processed', type: task.type, durMs: dur })
      } catch (err) {
        logger.warn({ msg: 'task failed, requeueing', err })
        // naive retry by re-queueing to tail
        this.q.push(task)
        await delay(250)
      }
    }
  }
}

export const changeQueue = new InMemoryQueue()
export { createNodeTask }
