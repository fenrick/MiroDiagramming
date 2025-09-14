import { vi } from 'vitest'

import type { BoardLike } from '../src/board/board'

/**
 * Provide a basic Miro board mock for tests.
 *
 * Overrides the global `miro.board` reference with a stub and
 * returns the board for additional customisation.
 *
 * @param overrides - Board methods to override in the stub.
 * @returns The mock board instance.
 */
export function mockBoard(overrides: Partial<BoardLike> = {}, id = 'b1'): BoardLike {
  const board = {
    getSelection: vi.fn().mockResolvedValue([]),
    info: { id },
    getUserInfo: vi.fn().mockResolvedValue({ id: 'u1', name: 'Test' }),
    ...overrides,
  } as unknown as BoardLike
  ;(globalThis as { miro?: { board?: BoardLike } }).miro = { board }
  return board
}
