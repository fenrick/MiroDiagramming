export interface BoardLike {
  getSelection(): Promise<Array<Record<string, unknown>>>;
  group?(opts: { items: Array<Record<string, unknown>> }): Promise<unknown>;
  addListener?(event: string, cb: () => void): () => void;
}

export function getBoard(board?: BoardLike): BoardLike {
  const b =
    board ??
    (globalThis as unknown as { miro?: { board?: BoardLike } }).miro?.board;
  if (!b) throw new Error('Miro board not available');
  return b;
}
