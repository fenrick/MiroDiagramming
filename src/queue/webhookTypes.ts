/** Webhook event pushed from Miro. */
export interface WebhookEvent {
  event: string
  data: Record<string, unknown>
}

/** Payload schema for webhook requests. */
export interface WebhookPayload {
  events: WebhookEvent[]
}
