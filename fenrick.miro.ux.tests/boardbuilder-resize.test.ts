import { describe, expect, test, vi } from 'vitest';
import { BoardBuilder } from '../fenrick.miro.ux/src/board/board-builder';
import { templateManager } from '../fenrick.miro.ux/src/board/templates';
import { mockBoard } from './mock-board';
import type { BaseItem, GroupableItem } from '@mirohq/websdk-types';

describe('BoardBuilder resizeItem', () => {
  test('updates width and height without syncing', async () => {
    const builder = new BoardBuilder();
    const item = { width: 1, height: 2, sync: vi.fn() } as Partial<BaseItem> & {
      sync: vi.Mock;
    };
    await builder.resizeItem(item as unknown as BaseItem, 10, 20);
    expect(item.width).toBe(10);
    expect(item.height).toBe(20);
    expect(item.sync).not.toHaveBeenCalled();
  });

  test('createNode applies layout size', async () => {
    const builder = new BoardBuilder();
    vi.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ shape: 'rect', width: 10, height: 10 }],
    });
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      sync: vi.fn(),
      id: 's',
    } as unknown as Record<string, unknown>);
    const spy = vi.spyOn(builder, 'resizeItem').mockResolvedValue();
    await builder.createNode(
      { id: 'n', label: 'L', type: 'Motivation' } as {
        id: string;
        label: string;
        type: string;
      },
      { x: 0, y: 0, width: 50, height: 40 },
    );
    expect(spy).toHaveBeenCalled();
  });

  test('groupItems groups widgets together', async () => {
    const builder = new BoardBuilder();
    const board = mockBoard({
      group: vi.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
    });
    const a = { id: 'a' } as unknown as BaseItem;
    const b = { id: 'b' } as unknown as BaseItem;
    const group = await builder.groupItems([
      a as unknown as GroupableItem,
      b as unknown as GroupableItem,
    ]);
    expect(board.group).toHaveBeenCalledWith({ items: [a, b] });
    expect(group.id).toBe('g1');
  });
});
