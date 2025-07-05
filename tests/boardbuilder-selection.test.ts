import { describe, expect, test, vi } from 'vitest';
import { BoardBuilder } from '../src/board/board-builder';
import { mockBoard } from './mock-board';

describe('BoardBuilder.findNodeInSelection', () => {
  test('locates shape within the current selection', async () => {
    const shape = { type: 'shape', content: 'X' } as Record<string, unknown>;
    mockBoard({ getSelection: vi.fn().mockResolvedValue([shape]) });
    const builder = new BoardBuilder();
    const result = await builder.findNodeInSelection('any', 'X');
    expect(result).toBe(shape);
  });

  test('locates group by metadata in the selection', async () => {
    const item = {
      getMetadata: vi.fn().mockResolvedValue({ type: 'T', label: 'L' }),
    } as Record<string, unknown>;
    const group = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue([item]),
    } as Record<string, unknown>;
    mockBoard({ getSelection: vi.fn().mockResolvedValue([group]) });
    const builder = new BoardBuilder();
    const result = await builder.findNodeInSelection('T', 'L');
    expect(result).toBe(group);
  });
});
