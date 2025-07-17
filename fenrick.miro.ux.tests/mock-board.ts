import { vi } from 'vitest';
import type { BoardLike } from '../fenrick.miro.ux/src/board/board';

/**
 * Provide a basic Miro board mock for tests.
 *
 * Overrides the global `miro.board` reference with a stub and
 * returns the board for additional customisation.
 *
 * @param overrides - Board methods to override in the stub.
 * @returns The mock board instance.
 */
export function mockBoard(overrides: Partial<BoardLike> = {}): BoardLike {
  const board: BoardLike = {
    getSelection: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
  (globalThis as { miro?: { board?: BoardLike } }).miro = { board };
  return board;
}
