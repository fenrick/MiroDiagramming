import React from 'react';
import { BoardLike, getBoard } from '../../board/board';

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
    const update = async (): Promise<void> => {
      const s = await b.getSelection();
      if (active) setSel(s);
    };
    void update();
    b.ui?.on('selection:update', update);
    return () => {
      active = false;
      b.ui?.off?.('selection:update', update);
    };
  }, [board]);
  return sel;
}
