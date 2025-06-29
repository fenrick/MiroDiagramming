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

/**
 * Board API that supports querying widgets by type.
 *
 * This extends {@link BoardLike} with a `get` method, mirroring the
 * `miro.board.get()` call. Search utilities rely on this method to gather
 * candidate widgets when scanning the board.
 */
export interface BoardQueryLike extends BoardLike {
  get(opts: { type: string }): Promise<Array<Record<string, unknown>>>;
}

/**
 * Resolve the active board instance.
 *
 * Returns the provided board if given, otherwise falls back to the global
 * `miro.board` reference. Throws an error when no board API is available.
 *
 * @param board - Optional board object used primarily for testing.
 * @returns The board API instance.
 */
export function getBoard(board?: BoardLike): BoardLike {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  return b;
}

/**
 * Retrieve a board instance capable of widget queries.
 *
 * Wraps {@link getBoard} and casts the result to include the `get` method used
 * by board search utilities.
 *
 * @param board - Optional board override that implements `get`.
 * @returns Board API exposing query capabilities.
 */
export function getBoardWithQuery(board?: BoardQueryLike): BoardQueryLike {
  return getBoard(board) as BoardQueryLike;
}

/**
 * Fetch the first item from the current board selection.
 *
 * Convenience wrapper for {@link getBoard} that resolves the active board and
 * reads the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns The first selected item or `undefined` when nothing is selected.
 */
export async function getFirstSelection(
  board?: BoardLike,
): Promise<Record<string, unknown> | undefined> {
  const b = getBoard(board);
  const selection = await b.getSelection();
  return selection[0] as Record<string, unknown> | undefined;
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

/**
 * Invoke the `sync` method on a widget when available.
 *
 * Simplifies conditional sync calls across board utilities.
 */
/**
 * Widget-like type optionally exposing a `sync` method.
 */
export interface Syncable {
  /** Persist property changes to the board. */
  sync?: () => Promise<void>;
}

/**
 * Invoke the `sync` method on a widget when available.
 *
 * Simplifies conditional sync calls across board utilities.
 */
export async function maybeSync(item: Syncable): Promise<void> {
  if (typeof item.sync === 'function') {
    await item.sync();
  }
}
