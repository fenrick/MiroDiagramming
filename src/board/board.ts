export interface BoardUILike {
  on(
    event: 'selection:update',
    handler: (ev: { items: unknown[] }) => void,
  ): void;
  off?(
    event: 'selection:update',
    handler: (ev: { items: unknown[] }) => void,
  ): void;
}

export interface BoardLike {
  getSelection(): Promise<Array<Record<string, unknown>>>;
  group?(opts: { items: Array<Record<string, unknown>> }): Promise<unknown>;
  ui?: BoardUILike;
}

export interface BoardQueryLike extends BoardLike {
  get(opts: { type: string }): Promise<Array<Record<string, unknown>>>;
}

export function getBoard(board?: BoardLike): BoardLike {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  return b;
}

export function getBoardWithQuery(board?: BoardQueryLike): BoardQueryLike {
  return getBoard(board) as BoardQueryLike;
}

/**
 * Invoke a callback for every selected widget.
 *
 * Abstracts the common pattern of fetching the current selection and applying
 * asynchronous updates to each item.
 *
 * @param cb - Function invoked with each selected widget.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function forEachSelection(
  cb: (item: Record<string, unknown>) => Promise<void> | void,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  await Promise.all(selection.map((item) => cb(item)));
}
