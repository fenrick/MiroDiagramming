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

export interface StopOptions {
  /**
   * Drain queued work before resolving. Defaults to `true` so shutdown waits
   * for in-flight tasks to complete and the backlog to empty.
   */
  drain?: boolean
  /**
   * Maximum time in milliseconds to wait for draining to finish. Set to `null`
   * or `undefined` to wait indefinitely.
   */
  timeoutMs?: number | null
}

export class InMemoryChangeQueue {
  private q: ChangeTask[] = []
  private running = false
  private draining = false
  private accepting = true
  private workers = 0
  private active = 0
  private miro = new MiroService()
  private baseDelayMs = 250
  private maxDelayMs = 5000
  private defaultConcurrency = 2
  private defaultMaxRetries = 5
  private logger: LoggerLike = defaultLogger
  private warnThreshold = Number.POSITIVE_INFINITY
  private warnActive = false
  private drainWaiters: Array<() => void> = []
  private stopPromise: Promise<void> | null = null

  /**
   * Update default concurrency and retry/backoff settings.
   * Values less than 1 are clamped to 1.
   */
  configure(opts: {
    concurrency?: number
    baseDelayMs?: number
    maxDelayMs?: number
    maxRetries?: number
    warnLength?: number
  }) {
    if (opts.concurrency !== undefined) this.defaultConcurrency = Math.max(1, opts.concurrency)
    if (opts.baseDelayMs !== undefined) this.baseDelayMs = Math.max(1, opts.baseDelayMs)
    if (opts.maxDelayMs !== undefined) this.maxDelayMs = Math.max(this.baseDelayMs, opts.maxDelayMs)
    if (opts.maxRetries !== undefined) this.defaultMaxRetries = Math.max(1, opts.maxRetries)
    if (opts.warnLength !== undefined) {
      if (opts.warnLength > 0) {
        this.warnThreshold = opts.warnLength
      } else {
        this.warnThreshold = Number.POSITIVE_INFINITY
      }
      this.warnActive = false
    }
  }

  /** Inject a logger; defaults to a no-op logger. */
  setLogger(logger: LoggerLike) {
    this.logger = logger ?? defaultLogger
  }

  /** Queue a task for processing. */
  enqueue(task: ChangeTask) {
    if (!this.accepting) {
      this.logger.warn(
        { event: 'queue.enqueue.rejected', type: task.type, nodeId: task.nodeId },
        'changeQueue rejecting task while shutting down',
      )
      return
    }
    this.q.push(task)
    this.emitDepthSample('enqueue')
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
    this.draining = false
    this.accepting = true
    this.workers = Math.max(1, concurrency)
    for (let i = 0; i < this.workers; i += 1) {
      void this.loop(i + 1)
    }
    this.logger.info({ workers: this.workers }, 'changeQueue started')
    this.emitDepthSample('start')
  }

  /** Stop accepting new tasks and halt worker loops. */
  async stop({ drain = true, timeoutMs = 5000 }: StopOptions = {}) {
    if (this.stopPromise) {
      return this.stopPromise
    }

    this.accepting = false
    this.logger.info({ queued: this.q.length, inFlight: this.active }, 'changeQueue stopping')
    this.emitDepthSample('stop')

    if (!drain) {
      const dropped = this.q.length
      this.q = []
      this.running = false
      this.draining = false
      if (dropped > 0) {
        this.logger.warn({ dropped }, 'changeQueue dropped queued tasks without draining')
      }
      this.resolveDrainWaiters()
      return
    }

    this.running = false
    this.draining = true
    this.stopPromise = this.awaitDrain(timeoutMs)
    try {
      await this.stopPromise
    } finally {
      this.stopPromise = null
    }
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
    while (this.running || this.draining) {
      const task = this.q.shift()
      if (!task) {
        await delay(50)
        continue
      }
      this.active += 1
      this.emitDepthSample('dequeue')
      try {
        await this.process(task)
      } finally {
        this.active -= 1
        this.emitDepthSample('settle')
        this.resolveDrainWaiters()
      }
    }
    this.logger.info({ workerId }, 'worker stopped')
    this.resolveDrainWaiters()
  }

  private emitDepthSample(trigger: 'enqueue' | 'dequeue' | 'settle' | 'start' | 'stop') {
    const basePayload = {
      trigger,
      queued: this.q.length,
      inFlight: this.active,
      workers: this.workers,
    }

    if (!Number.isFinite(this.warnThreshold)) {
      this.logger.info({ event: 'queue.depth', ...basePayload }, 'changeQueue depth sample')
      return
    }

    const payload = { ...basePayload, threshold: this.warnThreshold }
    if (this.q.length >= this.warnThreshold) {
      if (!this.warnActive) {
        this.warnActive = true
        this.logger.warn(
          { event: 'queue.backpressure', ...payload },
          'changeQueue backlog exceeded soft threshold',
        )
      } else {
        this.logger.info({ event: 'queue.depth', ...payload }, 'changeQueue depth sample')
      }
    } else if (this.warnActive) {
      this.warnActive = false
      this.logger.info(
        { event: 'queue.backpressure.recovered', ...payload },
        'changeQueue backlog recovered below soft threshold',
      )
    } else {
      this.logger.info({ event: 'queue.depth', ...payload }, 'changeQueue depth sample')
    }
  }

  private async awaitDrain(timeoutMs: number | null | undefined) {
    if (!this.draining) {
      return
    }

    if (this.q.length === 0 && this.active === 0) {
      this.draining = false
      return
    }

    const drainPromise = new Promise<void>((resolve) => {
      this.drainWaiters.push(resolve)
    })

    if (timeoutMs === null || timeoutMs === undefined) {
      await drainPromise
      return
    }

    const result = await Promise.race([
      drainPromise.then(() => 'drained'),
      delay(timeoutMs).then(() => 'timeout'),
    ])

    if (result === 'timeout') {
      this.logger.error(
        { queued: this.q.length, inFlight: this.active, timeoutMs },
        'changeQueue draining timed out; pending work may be lost',
      )
      this.draining = false
      const waiters = this.drainWaiters.splice(0)
      waiters.forEach((resolve) => resolve())
    }
  }

  private resolveDrainWaiters() {
    if (!this.draining) {
      return
    }
    if (this.q.length > 0 || this.active > 0) {
      return
    }
    this.draining = false
    const waiters = this.drainWaiters.splice(0)
    waiters.forEach((resolve) => resolve())
  }
}

export const changeQueue = new InMemoryChangeQueue()
export { createNodeTask }
