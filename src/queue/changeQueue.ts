import { setTimeout as delay } from 'node:timers/promises'

import { MiroService } from '../services/miroService.js'
import { createLogger } from '../config/logger.js'

import { createNodeTask, type ChangeTask } from './types.js'

const logger = createLogger()

class InMemoryQueue {
  private q: ChangeTask[] = []
  private running = false
  private workers = 0
  private active = 0
  private miro = new MiroService()
  private readonly baseDelayMs = 250
  private readonly maxDelayMs = 5000
  private readonly defaultConcurrency = 2

  enqueue(task: ChangeTask) {
    this.q.push(task)
  }

  size() {
    return this.q.length
  }

  inFlight() {
    return this.active
  }

  start(concurrency = this.defaultConcurrency) {
    if (this.running) return
    if (process.env.NODE_ENV === 'test') return
    this.running = true
    this.workers = Math.max(1, concurrency)
    for (let i = 0; i < this.workers; i += 1) {
      void this.loop(i + 1)
    }
    logger.info({ workers: this.workers }, 'changeQueue started')
  }

  stop() {
    this.running = false
    logger.info({ queued: this.q.length }, 'changeQueue stopping')
  }

  private async process(task: ChangeTask): Promise<void> {
    const started = Date.now()
    try {
      if (task.type === 'create_node') {
        await this.miro.createNode(task.userId, task.nodeId, task.data)
      }
      const dur = Date.now() - started
      logger.info({
        event: 'task.processed',
        type: task.type,
        nodeId: task.nodeId,
        attempts: (task.retryCount ?? 0) + 1,
        durMs: dur,
        queued: this.q.length,
        inFlight: this.active,
      })
    } catch (err) {
      const retry = (task.retryCount ?? 0) + 1
      const maxRetries = task.maxRetries ?? 5
      if (retry > maxRetries) {
        logger.error({
          event: 'task.dropped',
          type: task.type,
          nodeId: task.nodeId,
          attempts: retry,
          err,
        })
        return
      }
      const backoff = Math.min(this.baseDelayMs * 2 ** (retry - 1), this.maxDelayMs)
      const jitter = Math.floor(Math.random() * 50)
      logger.warn({
        event: 'task.retry',
        type: task.type,
        nodeId: task.nodeId,
        attempts: retry,
        backoffMs: backoff + jitter,
        err,
      })
      // Wait and re-enqueue with incremented retryCount
      await delay(backoff + jitter)
      task.retryCount = retry
      this.q.push(task)
    }
  }

  private async loop(workerId: number) {
    while (this.running) {
      const task = this.q.shift()
      if (!task) {
        await delay(50)
        continue
      }
      this.active += 1
      try {
        await this.process(task)
      } finally {
        this.active -= 1
      }
    }
    logger.info({ workerId }, 'worker stopped')
  }
}

export const changeQueue = new InMemoryQueue()
export { createNodeTask }
