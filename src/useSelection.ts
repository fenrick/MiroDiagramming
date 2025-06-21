import React from 'react';
import { BoardLike, getBoard } from './board';

/**
 * React hook returning the current board selection.
 *
 * It listens for `SELECTION_UPDATED` events when available.
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
    const off = b.addListener?.('SELECTION_UPDATED', update);
    return () => {
      active = false;
      if (typeof off === 'function') off();
    };
  }, [board]);
  return sel;
}
