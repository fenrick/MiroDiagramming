import { setTimeout as delay } from 'node:timers/promises'

/**
 * In-memory change queue with simple concurrency and retry/backoff.
 *
 * - Uses exponential backoff with jitter on retriable failures
 * - Allows tuning via `configure` and log injection via `setLogger`
 * - Default settings favor safety over throughput
 */

import { MiroService } from '../services/miroService.js'

import { createNodeTask, type ChangeTask } from './types.js'

type LoggerLike = {
  info: (obj: unknown, msg?: string) => void
  warn: (obj: unknown, msg?: string) => void
  error: (obj: unknown, msg?: string) => void
}

const defaultLogger: LoggerLike = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

class InMemoryQueue {
  private q: ChangeTask[] = []
  private running = false
  private workers = 0
  private active = 0
  private miro = new MiroService()
  private baseDelayMs = 250
  private maxDelayMs = 5000
  private defaultConcurrency = 2
  private defaultMaxRetries = 5
  private logger: LoggerLike = defaultLogger

  configure(opts: {
    concurrency?: number
    baseDelayMs?: number
    maxDelayMs?: number
    maxRetries?: number
  }) {
    if (opts.concurrency !== undefined) this.defaultConcurrency = Math.max(1, opts.concurrency)
    if (opts.baseDelayMs !== undefined) this.baseDelayMs = Math.max(1, opts.baseDelayMs)
    if (opts.maxDelayMs !== undefined) this.maxDelayMs = Math.max(this.baseDelayMs, opts.maxDelayMs)
    if (opts.maxRetries !== undefined) this.defaultMaxRetries = Math.max(1, opts.maxRetries)
  }

  setLogger(logger: LoggerLike) {
    this.logger = logger ?? defaultLogger
  }

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
    this.logger.info({ workers: this.workers }, 'changeQueue started')
  }

  stop() {
    this.running = false
    this.logger.info({ queued: this.q.length }, 'changeQueue stopping')
  }

  private async process(task: ChangeTask): Promise<void> {
    const started = Date.now()
    try {
      if (task.type === 'create_node') {
        await this.miro.createNode(task.userId, task.nodeId, task.data)
      }
      const dur = Date.now() - started
      this.logger.info({
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
      const maxRetries = task.maxRetries ?? this.defaultMaxRetries
      if (retry > maxRetries) {
        this.logger.error({
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
      this.logger.warn({
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
    this.logger.info({ workerId }, 'worker stopped')
  }
}

export const changeQueue = new InMemoryQueue()
export { createNodeTask }
