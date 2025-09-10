import type { BaseItem } from '@mirohq/websdk-types'

import { boardCache } from './board-cache'
import { maybeSync } from './board'
import { TagClient, type TagInfo } from '../core/utils/tag-client'

type TagLike = Pick<TagInfo, 'id' | 'title'>

function extractBracketTags(text: string): { tags: string[]; stripped: string } {
  const tagSet = new Set<string>()
  const regex = /\[([^\]]+)\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    const name = match[1]?.trim()
    if (name) tagSet.add(name)
  }
  const stripped = text.replace(regex, '').replace(/\s{2,}/g, ' ').trim()
  return { tags: [...tagSet], stripped }
}

async function getTagMap(boardId: string): Promise<Map<string, TagLike>> {
  const client = new TagClient(boardId, '/api/boards')
  const tags = await client.getTags()
  return new Map(tags.map((t) => [t.title, { id: t.id, title: t.title }]))
}

async function ensureTagIds(names: string[], tagMap: Map<string, TagLike>): Promise<string[]> {
  const ids: string[] = []
  for (const name of new Set(names)) {
    let tag = tagMap.get(name)
    if (!tag) {
      // Create client-side to keep this purely front-end
      tag = (await miro.board.createTag({ title: name })) as unknown as TagLike
      tagMap.set(name, tag)
    }
    if (tag.id) ids.push(tag.id)
  }
  return ids
}

function readStickyText(item: Record<string, unknown>): string | undefined {
  const text = (item as { plainText?: string }).plainText
  if (typeof text === 'string' && text.length > 0) return text
  const content = (item as { content?: string }).content
  if (typeof content === 'string') return content
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested && typeof nested.plainText === 'string') return nested.plainText
  if (nested && typeof nested.content === 'string') return nested.content
  return undefined
}

function writeStickyText(item: Record<string, unknown>, text: string): void {
  if (typeof (item as { plainText?: string }).plainText === 'string') {
    ;(item as { plainText?: string }).plainText = text
  }
  if (typeof (item as { content?: string }).content === 'string') {
    ;(item as { content?: string }).content = text
  }
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested) {
    if (typeof nested.plainText === 'string') nested.plainText = text
    if (typeof nested.content === 'string') nested.content = text
  }
}

/**
 * Assign tags found in square brackets to selected sticky notes.
 *
 * - Extracts unique tag names from `[...]` in the sticky content.
 * - Ensures tags exist (creating missing ones).
 * - Adds tag IDs to the sticky without removing existing tags.
 * - Only after successfully applying tags, removes the bracketed text.
 * - On failure to assign tags, leaves the original text unchanged.
 */
export async function applyBracketTagsToSelectedStickies(): Promise<void> {
  const boardId = (globalThis as unknown as { miro?: { board?: { id?: string } } }).miro?.board?.id
  if (!boardId) return
  const tagMap = await getTagMap(boardId)

  const selection = await boardCache.getSelection()
  const stickies = selection.filter((i) => (i as BaseItem).type === 'sticky_note')
  if (!stickies.length) return

  // Pre-scan all stickies to collect unique tag names across the selection
  const allNames = new Set<string>()
  for (const item of stickies) {
    const t = readStickyText(item)
    if (!t) continue
    const { tags } = extractBracketTags(t)
    tags.forEach((n) => allNames.add(n))
  }

  // Ensure missing tags once (cached in tagMap). Ignore failures.
  try {
    await ensureTagIds([...allNames], tagMap)
  } catch {
    // Best-effort: unresolved names simply won't be in tagMap
  }

  for (const item of stickies) {
    const text = readStickyText(item)
    if (!text) continue
    const { tags, stripped } = extractBracketTags(text)
    if (tags.length === 0) continue
    try {
      // Resolve known IDs from cache; skip names that failed creation
      const resolvedIds = tags
        .map((n) => tagMap.get(n)?.id)
        .filter((id): id is string => typeof id === 'string')

      const existing = ((item as unknown as { tagIds?: string[] }).tagIds ?? []) as string[]
      const merged = Array.from(new Set([...(existing ?? []), ...resolvedIds]))
      ;(item as unknown as { tagIds?: string[] }).tagIds = merged
      await maybeSync(item as unknown as { sync?: () => Promise<void> })

      // Only strip text if all names resolved to IDs and tagging succeeded
      const allResolved = tags.every((n) => Boolean(tagMap.get(n)?.id))
      if (allResolved) {
        writeStickyText(item, stripped)
        await maybeSync(item as unknown as { sync?: () => Promise<void> })
      }
    } catch {
      // Leave the text unchanged when tagging fails
    }
  }
}
