import { setTimeout as delay } from 'node:timers/promises'

/**
 * In-memory change queue coordinating writes to the Miro API.
 *
 * - Multiple worker loops pull tasks concurrently up to a configurable limit
 * - Retries use exponential backoff with jitter between the configured
 *   `baseDelayMs` and `maxDelayMs`
 * - Tasks exceeding the retry limit are dropped and logged as errors
 */

import type { FastifyBaseLogger } from 'fastify'

import { MiroService } from '../services/miroService.js'

import { createNodeTask, type ChangeTask } from './types.js'

type LoggerLike = Pick<FastifyBaseLogger, 'info' | 'warn' | 'error'>

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

  /**
   * Update default concurrency and retry/backoff settings.
   * Values less than 1 are clamped to 1.
   */
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

  /** Inject a logger; defaults to a no-op logger. */
  setLogger(logger: LoggerLike) {
    this.logger = logger ?? defaultLogger
  }

  /** Queue a task for processing. */
  enqueue(task: ChangeTask) {
    this.q.push(task)
  }

  /** Number of queued tasks awaiting execution. */
  size() {
    return this.q.length
  }

  /** Number of tasks currently being processed. */
  inFlight() {
    return this.active
  }

  /**
   * Start worker loops that continually pull tasks from the queue.
   * Skips execution when running in tests to keep them deterministic.
   */
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

  /** Stop accepting new tasks and halt worker loops. */
  stop() {
    this.running = false
    this.logger.info({ queued: this.q.length }, 'changeQueue stopping')
  }

  /**
   * Execute a task with retry logic.
   * Retries grow exponentially and include a small random jitter to avoid
   * thundering herds. Once the retry limit is exceeded the task is dropped.
   */
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

  /** Worker loop pulling tasks from the queue while the queue is running. */
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
