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

export function getBoard(board?: BoardLike): BoardLike {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  return b;
}
