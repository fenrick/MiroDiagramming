import React from 'react';
import { BoardLike, getBoard } from '../../board/board';
import { boardCache } from '../../board/board-cache';
import * as log from '../../logger';

/**
 * React hook returning the current board selection.
 *
 * It listens for board selection updates via `miro.board.ui.on`
 * when available.
 */
export function useSelection(
  board?: BoardLike,
): Array<Record<string, unknown>> {
  const [sel, setSel] = React.useState<Array<Record<string, unknown>>>([]);
  React.useEffect(() => {
    let b: BoardLike;
    try {
      b = getBoard(board);
    } catch {
      return;
    }
    let active = true;
    const update = (ev?: { items: unknown[] }): void => {
      if (ev && Array.isArray(ev.items)) {
        const items = ev.items as Array<Record<string, unknown>>;
        log.trace({ count: items.length }, 'Selection event received');
        boardCache.setSelection(items);
        if (active) {
          setSel(items);
        }
        return;
      }
      log.trace('Fetching selection due to missing event payload');
      boardCache.clearSelection();
      boardCache.getSelection(b).then(s => {
        if (active) {
          setSel(s);
        }
      });
    };
    update();
    b.ui?.on('selection:update', update);
    return () => {
      active = false;
      b.ui?.off?.('selection:update', update);
    };
  }, [board]);
  return sel;
}
