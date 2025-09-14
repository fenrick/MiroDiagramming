import type { BaseItem } from '@mirohq/websdk-types'

import { TagClient, type TagInfo } from '../core/utils/tag-client'
import { readItemText, writeItemText } from '../core/utils/text-utils'
import { pushToast } from '../ui/components/Toast'

import { ensureBoard, maybeSync, type BoardLike } from './board'
import { boardCache } from './board-cache'

type TagLike = Pick<TagInfo, 'id' | 'title'>

function extractBracketTags(text: string): { tags: string[]; stripped: string } {
  const tagSet = new Set<string>()
  const regex = /\[([^\]]+)\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    const name = match[1]?.trim()
    if (name) tagSet.add(name)
  }
  const stripped = text
    .replace(regex, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { tags: [...tagSet], stripped }
}

async function getTagMap(client: TagClient): Promise<Map<string, TagLike>> {
  const tags = await client.getTags()
  return new Map(tags.map((t) => [t.title, { id: t.id, title: t.title }]))
}

async function ensureTagIds(
  names: string[],
  tagMap: Map<string, TagLike>,
  client: TagClient,
): Promise<string[]> {
  const ids: string[] = []
  for (const name of new Set(names)) {
    let tag = tagMap.get(name)
    if (!tag) {
      tag = (await client.createTag(name)) as TagLike | undefined
      if (tag) {
        tagMap.set(name, tag)
      }
    }
    if (tag?.id) ids.push(tag.id)
  }
  return ids
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
  const maybeBoard = ensureBoard() as (BoardLike & { id?: string }) | undefined
  if (!maybeBoard?.id) {
    return
  }
  const board = maybeBoard as BoardLike & { id: string }
  const client = new TagClient(board.id, '/api/boards')
  const tagMap = await getTagMap(client)

  const selection = await boardCache.getSelection(board)
  const stickies = selection.filter((i) => (i as BaseItem).type === 'sticky_note')
  if (!stickies.length) {
    pushToast({ message: 'Select sticky notes to tag.' })
    return
  }

  // Pre-scan all stickies to collect unique tag names across the selection
  const allNames = new Set<string>()
  for (const item of stickies) {
    const t = readItemText(item)
    if (!t) continue
    const { tags } = extractBracketTags(t)
    tags.forEach((n) => allNames.add(n))
  }

  // Ensure missing tags once (cached in tagMap). Ignore failures.
  try {
    await ensureTagIds([...allNames], tagMap, client)
  } catch {
    // Best-effort: unresolved names simply won't be in tagMap
  }

  let tagged = 0
  for (const item of stickies) {
    const text = readItemText(item)
    if (!text) continue
    const { tags, stripped } = extractBracketTags(text)
    if (tags.length === 0) continue
    try {
      // Resolve known IDs from cache; skip names that failed creation
      const resolvedIds = tags
        .map((n) => tagMap.get(n)?.id)
        .filter((id): id is string => typeof id === 'string')

      const existing = ((item as { tagIds?: string[] }).tagIds ?? []) as string[]
      const merged = Array.from(new Set([...(existing ?? []), ...resolvedIds]))
      ;(item as { tagIds?: string[] }).tagIds = merged
      await maybeSync(item as { sync?: () => Promise<void> })

      // Only strip text if all names resolved to IDs and tagging succeeded
      const allResolved = tags.every((n) => Boolean(tagMap.get(n)?.id))
      if (allResolved) {
        writeItemText(item, stripped)
        await maybeSync(item as { sync?: () => Promise<void> })
        tagged += 1
      }
    } catch {
      // Leave the text unchanged when tagging fails
    }
  }
  // Clear caches so subsequent reads see updated tags/text
  boardCache.reset()
  pushToast({
    message:
      tagged > 0
        ? `Applied tags to ${tagged} sticky note${tagged === 1 ? '' : 's'}.`
        : 'No [tags] found in selected stickies.',
  })
}
