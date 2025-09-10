import type { WebhookPayload } from './webhookTypes.js'

/**
 * In-memory queue for webhook payloads.
 * Tests can inspect and clear the queue.
 */
class WebhookQueue {
  private q: WebhookPayload[] = []

  enqueue(payload: WebhookPayload) {
    this.q.push(payload)
  }

  size() {
    return this.q.length
  }

  clear() {
    this.q = []
  }

  take() {
    return this.q.shift()
  }
}

export const webhookQueue = new WebhookQueue()
