import { BoardBuilder } from '../src/board/board-builder';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('BoardBuilder.findNodeInSelection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('locates shape within the current selection', async () => {
    const shape = { type: 'shape', content: 'X' } as Record<string, unknown>;
    global.miro = {
      board: { getSelection: jest.fn().mockResolvedValue([shape]) },
    };
    const builder = new BoardBuilder();
    const result = await builder.findNodeInSelection('any', 'X');
    expect(result).toBe(shape);
  });

  test('locates group by metadata in the selection', async () => {
    const item = {
      getMetadata: jest.fn().mockResolvedValue({ type: 'T', label: 'L' }),
    } as Record<string, unknown>;
    const group = {
      type: 'group',
      getItems: jest.fn().mockResolvedValue([item]),
    } as Record<string, unknown>;
    global.miro = {
      board: { getSelection: jest.fn().mockResolvedValue([group]) },
    };
    const builder = new BoardBuilder();
    const result = await builder.findNodeInSelection('T', 'L');
    expect(result).toBe(group);
  });
});
