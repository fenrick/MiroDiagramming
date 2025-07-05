import { describe, expect, test, vi } from 'vitest';
import { BoardBuilder, updateConnector } from '../src/board/board-builder';
import { mockBoard } from './mock-board';

interface GlobalWithMiro {
  miro?: { board: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Additional tests exercising lookup and connector styling logic.
 */

describe('BoardBuilder lookup and connector updates', () => {
  test('findNode caches shapes by text', async () => {
    const shape = { content: 'B' } as Record<string, unknown>;
    mockBoard({ get: vi.fn().mockResolvedValue([shape]) });
    const builder = new BoardBuilder();
    await builder.findNode('Business', 'B');
    await builder.findNode('Business', 'B');
    expect((global.miro.board.get as vi.Mock).mock.calls.length).toBe(1);
  });

  test('reset clears the shape cache', async () => {
    const shape = { content: 'B' } as Record<string, unknown>;
    mockBoard({ get: vi.fn().mockResolvedValue([shape]) });
    const builder = new BoardBuilder();
    await builder.findNode('Business', 'B');
    builder.reset();
    await builder.findNode('Business', 'B');
    expect((global.miro.board.get as vi.Mock).mock.calls.length).toBe(2);
  });

  test('lookup matches shape text regardless of metadata', async () => {
    const shape = {
      content: 'A',
      getMetadata: vi.fn().mockResolvedValue({ type: 'X', label: 'Y' }),
    } as Record<string, unknown>;
    mockBoard({ get: vi.fn().mockResolvedValue([shape]) });
    const builder = new BoardBuilder();
    const result = await builder.findNode('Business', 'A');
    expect(result).toBe(shape);
  });

  test('createEdges skips connector lookup', async () => {
    const board = mockBoard({
      get: vi.fn(),
      createConnector: vi
        .fn()
        .mockResolvedValue({
          setMetadata: vi.fn(),
          getMetadata: vi.fn(),
          sync: vi.fn(),
          id: 'c1',
        }),
    });
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;

    await builder.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      nodeMap,
    );
    expect(board.get).not.toHaveBeenCalled();
  });

  test('updateConnector merges style from template', () => {
    const existing = { style: {} } as Record<string, unknown>;
    updateConnector(
      existing as unknown as Connector,
      {
        from: 'n1',
        to: 'n2',
      } as unknown as import('../src/core/graph').EdgeData,
      { shape: 'curved', style: { strokeStyle: 'dashed' } },
      undefined,
    );
    expect(existing.style.strokeStyle).toBe('dashed');
  });
});
