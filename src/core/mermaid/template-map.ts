const NODE_TEMPLATE_MAP: Record<string, string> = {
  system: 'Technology',
  technology: 'Technology',
  process: 'Application',
  application: 'Application',
  app: 'Application',
  decision: 'Business',
  business: 'Business',
  data: 'Physical',
  database: 'Physical',
  note: 'Motivation',
  info: 'Motivation',
}

const EDGE_TEMPLATE_MAP: Record<string, string> = {
  dashed: 'flow',
  flow: 'flow',
  realization: 'realization',
  realizes: 'realization',
  accesses: 'access',
  access: 'access',
  influence: 'influence',
}

export function mapNodeClassesToTemplate(
  classes: readonly string[] | undefined,
): string | undefined {
  if (!classes) {
    return undefined
  }
  for (const cls of classes) {
    const key = cls.toLowerCase()
    const template = NODE_TEMPLATE_MAP[key]
    if (template) {
      return template
    }
  }
  return undefined
}

export function mapEdgeClassesToTemplate(
  classes: readonly string[] | undefined,
): string | undefined {
  if (!classes) {
    return undefined
  }
  for (const cls of classes) {
    const key = cls.toLowerCase()
    const template = EDGE_TEMPLATE_MAP[key]
    if (template) {
      return template
    }
  }
  return undefined
}
