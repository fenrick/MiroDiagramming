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
  startBatch?(): Promise<void>;
  endBatch?(): Promise<void>;
  abortBatch?(): Promise<void>;
}

export interface BoardQueryLike extends BoardLike {
  get(opts: { type: string }): Promise<Array<Record<string, unknown>>>;
}
