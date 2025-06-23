import { BoardBuilder } from '../src/board/BoardBuilder';
import { templateManager } from '../src/board/templates';

interface GlobalWithMiro {
  miro?: { board: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Unit tests targeting rarely hit branches within BoardBuilder
 * to increase overall coverage.
 */

describe('BoardBuilder branch coverage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('findNode searches groups', async () => {
    // Mock a group containing an item whose metadata matches the search
    const item = {
      getMetadata: jest.fn().mockResolvedValue({ type: 'Role', label: 'A' }),
    } as Record<string, unknown>;
    const group = { getItems: jest.fn().mockResolvedValue([item]) } as Record<
      string,
      unknown
    >;
    // `board.get` first returns no shapes then a single group
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([group]),
      },
    };
    const builder = new BoardBuilder();
    // Expect the builder to return the matching group
    const result = await builder.findNode('Role', 'A');
    expect(result).toBe(group);
  });

  test('createNode applies fill color when style missing', async () => {
    const builder = new BoardBuilder();
    // Element template providing default fill style
    const el = { shape: 'rect', fill: '#fff', width: 10, height: 10 };
    const shape = {
      type: 'shape',
      style: {},
      setMetadata: jest.fn(),
    } as Record<string, unknown>;
    // Pretend the node does not already exist
    jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    // Template lookup returns our element
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue({ elements: [el] });
    // createFromTemplate applies the element to the new shape
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockImplementation(async () => {
        (
          builder as unknown as {
            applyShapeElement: (i: unknown, e: unknown, l: string) => void;
          }
        ).applyShapeElement(shape, el, 'L');
        return shape;
      });
    await builder.createNode(
      { id: 'n', label: 'L', type: 'fill' } as unknown as Record<
        string,
        unknown
      >,
      {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
    );
    // The fill color from the element should be applied
    expect(shape.style.fillColor).toBe('#fff');
  });

  test('applyTextElement merges style when provided', () => {
    const builder = new BoardBuilder();
    const item: Record<string, unknown> = {
      type: 'text',
      style: { fontSize: 10 },
    };
    const el = { text: 'T', style: { color: 'red' } } as Record<
      string,
      unknown
    >;
    // Applying a text element should merge the style properties
    (
      builder as unknown as {
        applyTextElement: (i: unknown, e: unknown, l: string) => void;
      }
    ).applyTextElement(item, el, 'L');
    expect(item.style.color).toBe('red');
    expect(item.style.fontSize).toBe(10);
  });

  test('createEdges skips edges with missing nodes', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        createConnector: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1',
        }),
      },
    };
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2' }];
    const result = await builder.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      { n1: {} } as Record<string, unknown>,
    );
    expect(result).toEqual([]);
  });

  test('searchGroups ignores non-array item lists', async () => {
    const group = { getItems: jest.fn().mockResolvedValue(null) } as Record<
      string,
      unknown
    >;
    global.miro = {
      board: { get: jest.fn().mockResolvedValue([group]) },
    };
    const builder = new BoardBuilder();
    const result = await (
      builder as unknown as {
        searchGroups: (t: string, l: string) => Promise<unknown>;
      }
    ).searchGroups('Role', 'A');
    expect(result).toBeUndefined();
  });

  test('updateConnector handles missing template and hints', () => {
    const connector: Record<string, unknown> = { style: {}, shape: 'curved' };
    const builder = new BoardBuilder();
    (
      builder as unknown as { updateConnector: (...args: unknown[]) => void }
    ).updateConnector(connector, { from: 'a', to: 'b' }, undefined, undefined);
    expect(connector.shape).toBe('curved');
    expect(connector.style).toEqual({});
  });

  test('searchShapes returns undefined when no shapes match', async () => {
    const builder = new BoardBuilder();
    global.miro = { board: { get: jest.fn().mockResolvedValue([]) } };
    const result = await (
      builder as unknown as {
        searchShapes: (t: string, l: string) => Promise<unknown>;
      }
    ).searchShapes('Role', 'A');
    expect(result).toBeUndefined();
  });

  test('applyShapeElement preserves existing fillColor', () => {
    const builder = new BoardBuilder();
    const item: Record<string, unknown> = {
      type: 'shape',
      style: { fillColor: '#abc' },
    };
    const el = { shape: 'rect', fill: '#fff', width: 1, height: 1 };
    (
      builder as unknown as {
        applyShapeElement: (i: unknown, e: unknown, l: string) => void;
      }
    ).applyShapeElement(item, el, 'L');
    expect(item.style.fillColor).toBe('#abc');
  });

  test('applyElementToItem handles text widgets', () => {
    const builder = new BoardBuilder();
    const item: Record<string, unknown> = { type: 'text', style: {} };
    const el = { text: 'Name' } as Record<string, unknown>;
    (
      builder as unknown as {
        applyElementToItem: (i: unknown, e: unknown, l: string) => void;
      }
    ).applyElementToItem(item, el, 'Label');
    expect(item.content).toBe('Name');
  });

  test('updateConnector applies hint positions', () => {
    const builder = new BoardBuilder();
    const connector: Record<string, unknown> = { style: {}, shape: 'curved' };
    (
      builder as unknown as { updateConnector: (...args: unknown[]) => void }
    ).updateConnector(
      connector,
      { from: 'a', to: 'b', label: 'L' },
      { shape: 'elbowed', style: { strokeStyle: 'dotted' } },
      { startPosition: { x: 0, y: 0 }, endPosition: { x: 1, y: 1 } },
    );
    expect(connector.start.position).toEqual({ x: 0, y: 0 });
    expect(connector.end.position).toEqual({ x: 1, y: 1 });
    expect(connector.style.strokeStyle).toBe('dotted');
  });

  test('createConnector without label sets no caption', async () => {
    const board = {
      createConnector: jest.fn().mockResolvedValue({ setMetadata: jest.fn() }),
    };
    global.miro = { board };
    const builder = new BoardBuilder();
    const edge = { from: 'n1', to: 'n2' } as Record<string, unknown>;
    const result = await (
      builder as unknown as {
        createConnector: (...args: unknown[]) => Promise<unknown>;
      }
    ).createConnector(
      edge,
      { id: 'a' } as Record<string, unknown>,
      { id: 'b' } as Record<string, unknown>,
      undefined,
      undefined,
    );
    const args = board.createConnector.mock.calls[0][0];
    expect(args.captions).toBeUndefined();
    expect(result).toBeDefined();
  });
});
