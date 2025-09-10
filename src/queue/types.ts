export interface ChangeTask {
  userId: string
  type: 'create_node'
  nodeId: string
  data: Record<string, unknown>
}

export function createNodeTask(
  userId: string,
  nodeId: string,
  data: Record<string, unknown>,
): ChangeTask {
  return { userId, type: 'create_node', nodeId, data }
}
