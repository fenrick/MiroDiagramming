import {
  renameSelectedFrames,
  lockSelectedFrames,
} from '../src/board/frame-tools';
import { BoardLike } from '../src/board/board';

describe('frame-tools', () => {
  test('renameSelectedFrames updates titles in order', async () => {
    const frames = [
      { x: 20, y: 0, title: 'old', sync: jest.fn(), type: 'frame' },
      { x: 10, y: 0, title: 'old2', sync: jest.fn(), type: 'frame' },
    ];
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue(frames),
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
      getSelection: jest.fn().mockResolvedValue([frame]),
    };
    await renameSelectedFrames({ prefix: 'Z-' }, board);
    expect(contexts[0]).toBe(frame);
    expect(frame.title).toBe('Z-0');
  });

  test('renameSelectedFrames ignores non-frames', async () => {
    const items = [
      { x: 0, title: 'A', sync: jest.fn(), type: 'shape' },
      { x: 1, title: 'B', sync: jest.fn(), type: 'frame' },
    ];
    const board: BoardLike = {
      getSelection: jest.fn().mockResolvedValue(items),
    };
    await renameSelectedFrames({ prefix: 'X' }, board);
    expect(items[0].title).toBe('A');
    expect(items[1].title).toBe('X0');
  });

  test('renameSelectedFrames throws without board', async () => {
    await expect(renameSelectedFrames({ prefix: 'P' })).rejects.toThrow(
      'Miro board not available',
    );
  });

  describe('lockSelectedFrames', () => {
    test('locks frames and children', async () => {
      const child = { locked: false, sync: jest.fn() };
      const frame = {
        type: 'frame',
        locked: false,
        sync: jest.fn(),
        getChildren: jest.fn().mockResolvedValue([child]),
      };
      const board: BoardLike = {
        getSelection: jest.fn().mockResolvedValue([frame]),
      };
      await lockSelectedFrames(board);
      expect(frame.locked).toBe(true);
      expect(child.locked).toBe(true);
      expect(frame.sync).toHaveBeenCalled();
      expect(child.sync).toHaveBeenCalled();
    });

    test('ignores non-frame widgets', async () => {
      const item = { type: 'shape', locked: false, sync: jest.fn() };
      const board: BoardLike = {
        getSelection: jest.fn().mockResolvedValue([item]),
      };
      await lockSelectedFrames(board);
      expect(item.locked).toBe(false);
      expect(item.sync).not.toHaveBeenCalled();
    });

    test('throws without board', async () => {
      await expect(lockSelectedFrames()).rejects.toThrow(
        'Miro board not available',
      );
    });
  });
});
