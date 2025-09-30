export interface TagInfo {
  id: string
  title: string
  color?: string
}

interface BoardTagApi {
  readonly get?: (query: { type: string }) => Promise<unknown>
  readonly createTag?: (input: { title: string }) => Promise<unknown>
}

const resolveBoard = (): BoardTagApi | undefined => {
  const globalScope = globalThis as { miro?: { board?: unknown } }
  const candidate = globalScope.miro?.board
  if (candidate === undefined || candidate === null) {
    return undefined
  }
  if (typeof candidate !== 'object') {
    return undefined
  }
  return candidate as BoardTagApi
}

const toTagInfo = (input: unknown): TagInfo | undefined => {
  const record = input as { id?: unknown; title?: unknown; color?: unknown }
  const { id, title } = record
  if (typeof id !== 'string' || typeof title !== 'string') {
    return undefined
  }
  return {
    id,
    title,
    color: typeof record.color === 'string' ? record.color : undefined,
  }
}

/** Minimal client for board tag operations relying on the Web SDK. */
export class TagClient {
  public constructor() {
    // Non-empty body to satisfy lint; ready for future wiring
    void 0
  }

  /** Retrieve all tags for the board. */
  public async getTags(): Promise<TagInfo[]> {
    const board = resolveBoard()
    if (!board || typeof board.get !== 'function') {
      return []
    }
    const rawTags = await board.get({ type: 'tag' })
    if (!Array.isArray(rawTags)) {
      return []
    }
    const tags: TagInfo[] = []
    for (const tag of rawTags) {
      const info = toTagInfo(tag)
      if (info) {
        tags.push(info)
      }
    }
    return tags
  }

  /** Create a tag on the current board. */
  public async createTag(title: string): Promise<TagInfo | undefined> {
    const board = resolveBoard()
    if (!board || typeof board.createTag !== 'function') {
      return undefined
    }
    try {
      const created = await board.createTag({ title })
      const tag = created as TagInfo | undefined
      return tag
    } catch {
      return undefined
    }
  }
}
