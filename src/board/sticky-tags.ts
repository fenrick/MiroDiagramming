import type { BaseItem } from '@mirohq/websdk-types'

import { TagClient, type TagInfo } from '../core/utils/tag-client'
import { readItemText, writeItemText } from '../core/utils/text-utilities'
import { pushToast } from '../ui/components/toast'

import { ensureBoard, maybeSync, type BoardLike } from './board'
import { boardCache } from './board-cache'

type TagLike = Pick<TagInfo, 'id' | 'title'>

function extractBracketTags(text: string): { tags: string[]; stripped: string } {
  const tagSet = new Set<string>()
  const tagPattern = /\[([^[\]]{1,128})\]/g
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(text))) {
    const name = match[1]?.trim()
    if (name) {
      tagSet.add(name)
    }
  }
  const stripped = text
    .replaceAll(tagPattern, '')
    .replaceAll(/\s{2,}/g, ' ')
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
    if (tag?.id) {
      ids.push(tag.id)
    }
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
  if (!maybeBoard?.id) return
  const board = maybeBoard as BoardLike & { id: string }
  const client = new TagClient()
  const tagMap = await getTagMap(client)

  const stickies = await getSelectedStickies(board)
  if (stickies.length === 0) return

  await ensureTagMapForSelection(stickies, client, tagMap)
  const tagged = await tagStickies(stickies, tagMap)

  boardCache.reset(board)
  let message = 'No [tags] found in selected stickies.'
  if (tagged > 0) {
    const plural = tagged === 1 ? '' : 's'
    message = `Applied tags to ${tagged} sticky note${plural}.`
  }
  pushToast({ message })
}

async function getSelectedStickies(board: BoardLike): Promise<Record<string, unknown>[]> {
  const selection = await boardCache.getSelection(board)
  const stickies = selection.filter((index) => (index as BaseItem).type === 'sticky_note')
  if (stickies.length === 0) {
    pushToast({ message: 'Select sticky notes to tag.' })
  }
  return stickies
}

async function ensureTagMapForSelection(
  stickies: Record<string, unknown>[],
  client: TagClient,
  tagMap: Map<string, TagLike>,
): Promise<void> {
  const allNames = collectTagNames(stickies)
  try {
    await ensureTagIds([...allNames], tagMap, client)
  } catch {
    // Best-effort: unresolved names simply won't be in tagMap
  }
}

async function tagStickies(
  stickies: Record<string, unknown>[],
  tagMap: Map<string, TagLike>,
): Promise<number> {
  let tagged = 0
  for (const item of stickies) {
    const changed = await applyTagsAndMaybeStrip(item, tagMap)
    if (changed) tagged += 1
  }
  return tagged
}

function collectTagNames(stickies: Record<string, unknown>[]): Set<string> {
  const names = new Set<string>()
  for (const item of stickies) {
    const t = readItemText(item)
    if (!t) {
      continue
    }
    const { tags } = extractBracketTags(t)
    for (const n of tags) {
      names.add(n)
    }
  }
  return names
}

async function applyTagsAndMaybeStrip(
  item: Record<string, unknown>,
  tagMap: Map<string, TagLike>,
): Promise<boolean> {
  const text = readItemText(item)
  if (!text) {
    return false
  }
  const { tags, stripped } = extractBracketTags(text)
  if (tags.length === 0) {
    return false
  }
  try {
    const resolvedIds = tags
      .map((n) => tagMap.get(n)?.id)
      .filter((id): id is string => typeof id === 'string')

    const existing = ((item as { tagIds?: string[] }).tagIds ?? []) as string[]
    const merged = [...new Set([...(existing ?? []), ...resolvedIds])]
    ;(item as { tagIds?: string[] }).tagIds = merged
    await maybeSync(item as { sync?: () => Promise<void> })

    // Only strip text if all names resolved to IDs and tagging succeeded
    const allResolved = tags.every((n) => Boolean(tagMap.get(n)?.id))
    if (!allResolved) {
      return false
    }

    writeItemText(item, stripped)
    await maybeSync(item as { sync?: () => Promise<void> })
    return true
  } catch {
    return false
  }
}
