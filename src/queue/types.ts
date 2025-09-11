export interface ChangeTask {
  userId: string
  type: 'create_node'
  nodeId: string
  data: Record<string, unknown>
  /** Number of attempts performed so far. */
  retryCount?: number
  /** Max retries before giving up. */
  maxRetries?: number
  /** Creation timestamp for observability. */
  createdAt?: number
}

export function createNodeTask(
  userId: string,
  nodeId: string,
  data: Record<string, unknown>,
): ChangeTask {
  return {
    userId,
    type: 'create_node',
    nodeId,
    data,
    retryCount: 0,
    maxRetries: 5,
    createdAt: Date.now(),
  }
}
