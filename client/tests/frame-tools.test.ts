import { BoardLike } from '../src/board/board';
import { boardCache } from '../src/board/board-cache';
import {
  lockSelectedFrames,
  renameSelectedFrames,
} from '../src/board/frame-tools';

describe('frame-tools', () => {
  beforeEach(() => boardCache.reset());
  test('renameSelectedFrames updates titles in order', async () => {
    const frames = [
      { x: 20, y: 0, title: 'old', sync: vi.fn(), type: 'frame' },
      { x: 10, y: 0, title: 'old2', sync: vi.fn(), type: 'frame' },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(frames),
    };
    await renameSelectedFrames({ prefix: 'F-' }, board);
    expect(frames[1].title).toBe('F-0');
    expect(frames[0].title).toBe('F-1');
    expect(frames[0].sync).toHaveBeenCalled();
  });

  test('renameSelectedFrames preserves this context for sync', async () => {
    const contexts: unknown[] = [];
    const frame = {
      x: 0,
      y: 0,
      title: 'a',
      type: 'frame',
      sync() {
        contexts.push(this);
      },
    };
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue([frame]),
    };
    await renameSelectedFrames({ prefix: 'Z-' }, board);
    expect(contexts[0]).toBe(frame);
    expect(frame.title).toBe('Z-0');
  });

  test('renameSelectedFrames ignores non-frames', async () => {
    const items = [
      { x: 0, title: 'A', sync: vi.fn(), type: 'shape' },
      { x: 1, title: 'B', sync: vi.fn(), type: 'frame' },
    ];
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) };
    await renameSelectedFrames({ prefix: 'X' }, board);
    expect(items[0].title).toBe('A');
    expect(items[1].title).toBe('X0');
  });

  test('renameSelectedFrames does nothing when selection empty', async () => {
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue([]) };
    await renameSelectedFrames({ prefix: 'N-' }, board);
    expect(board.getSelection).toHaveBeenCalled();
  });

  test('renameSelectedFrames sorts by y when x equal', async () => {
    const frames = [
      { x: 0, y: 10, title: 'A', sync: vi.fn(), type: 'frame' },
      { x: 0, y: 0, title: 'B', sync: vi.fn(), type: 'frame' },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(frames),
    };
    await renameSelectedFrames({ prefix: 'Q' }, board);
    expect(frames[1].title).toBe('Q0');
    expect(frames[0].title).toBe('Q1');
  });

  test('renameSelectedFrames handles frames without sync or coordinates', async () => {
    const frame = { title: 'A', type: 'frame' };
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue([frame]),
    };
    await renameSelectedFrames({ prefix: 'R-' }, board);
    expect(frame.title).toBe('R-0');
  });

  test('renameSelectedFrames sorts frames missing coordinates', async () => {
    const frames = [
      { title: 'A', type: 'frame' },
      { x: 5, y: 0, title: 'B', type: 'frame', sync: vi.fn() },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(frames),
    };
    await renameSelectedFrames({ prefix: 'C' }, board);
    expect(frames[0].title).toBe('C0');
    expect(frames[1].title).toBe('C1');
  });

  test('renameSelectedFrames handles missing y for sort', async () => {
    const frames = [
      { x: 0, title: 'A', type: 'frame', sync: vi.fn() },
      { x: 0, y: 2, title: 'B', type: 'frame', sync: vi.fn() },
    ];
    const board: BoardLike = {
      getSelection: vi.fn().mockResolvedValue(frames),
    };
    await renameSelectedFrames({ prefix: 'D' }, board);
    expect(frames[0].title).toBe('D0');
    expect(frames[1].title).toBe('D1');
  });

  test('renameSelectedFrames throws without board', async () =>
    await expect(renameSelectedFrames({ prefix: 'P' })).rejects.toThrow(
      'Miro board not available',
    ));

  describe('lockSelectedFrames', () => {
    test('locks frames and children', async () => {
      const child = { locked: false, sync: vi.fn() };
      const frame = {
        type: 'frame',
        locked: false,
        sync: vi.fn(),
        getChildren: vi.fn().mockResolvedValue([child]),
      };
      const board: BoardLike = {
        getSelection: vi.fn().mockResolvedValue([frame]),
      };
      await lockSelectedFrames(board);
      expect(frame.locked).toBe(true);
      expect(child.locked).toBe(true);
      expect(frame.sync).toHaveBeenCalled();
      expect(child.sync).toHaveBeenCalled();
    });

    test('locks frames without children', async () => {
      const frame = {
        type: 'frame',
        locked: false,
        sync: vi.fn(),
        getChildren: vi.fn().mockResolvedValue([]),
      };
      const board: BoardLike = {
        getSelection: vi.fn().mockResolvedValue([frame]),
      };
      await lockSelectedFrames(board);
      expect(frame.locked).toBe(true);
      expect(frame.sync).toHaveBeenCalled();
    });

    test('locks frame even when getChildren missing', async () => {
      const frame = { type: 'frame', locked: false };
      const board: BoardLike = {
        getSelection: vi.fn().mockResolvedValue([frame]),
      };
      await lockSelectedFrames(board);
      expect(frame.locked).toBe(true);
    });

    test('does nothing when selection empty', async () => {
      const board: BoardLike = { getSelection: vi.fn().mockResolvedValue([]) };
      await lockSelectedFrames(board);
      expect(board.getSelection).toHaveBeenCalled();
    });

    test('ignores non-frame widgets', async () => {
      const item = { type: 'shape', locked: false, sync: vi.fn() };
      const board: BoardLike = {
        getSelection: vi.fn().mockResolvedValue([item]),
      };
      await lockSelectedFrames(board);
      expect(item.locked).toBe(false);
      expect(item.sync).not.toHaveBeenCalled();
    });

    test('throws without board', async () =>
      await expect(lockSelectedFrames()).rejects.toThrow(
        'Miro board not available',
      ));
  });
});
