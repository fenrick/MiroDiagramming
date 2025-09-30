import React from 'react'

import { type BoardLike, getBoard } from '../../board/board'
import { boardCache } from '../../board/board-cache'
import * as log from '../../logger'

/**
 * React hook returning the current board selection.
 *
 * It listens for board selection updates via `miro.board.ui.on`
 * when available.
 */
export function useSelection(board?: BoardLike): Record<string, unknown>[] {
  const [sel, setSel] = React.useState<Record<string, unknown>[]>([])
  React.useEffect(() => {
    let resolvedBoard: BoardLike
    try {
      resolvedBoard = getBoard(board)
    } catch {
      return
    }
    let active = true

    const update = async (event?: { items: unknown[] }): Promise<void> => {
      if (event && Array.isArray(event.items)) {
        const items = event.items as Record<string, unknown>[]
        log.trace({ count: items.length }, 'Selection event received')
        boardCache.setSelection(items)
        if (active) {
          setSel(items)
        }
        return
      }

      log.trace('Fetching selection due to missing event payload')
      boardCache.clearSelection()
      try {
        const selection = await boardCache.getSelection(resolvedBoard)
        if (active) {
          setSel(selection)
        }
      } catch (error: unknown) {
        log.warning({ error }, 'Failed to fetch selection')
      }
    }

    const listener = (payload?: { items: unknown[] }): void => {
      update(payload).catch((error: unknown) => {
        log.warning({ error }, 'Selection listener failed')
      })
    }

    update().catch((error: unknown) => {
      log.warning({ error }, 'Initial selection fetch failed')
    })
    resolvedBoard.ui?.on('selection:update', listener)
    return () => {
      active = false
      resolvedBoard.ui?.off?.('selection:update', listener)
    }
  }, [board])
  return sel
}
