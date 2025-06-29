import { BoardBuilder, updateConnector } from '../src/board/board-builder';
import { createConnector } from '../src/board/connector-utils';
import { searchGroups, searchShapes } from '../src/board/node-search';
import { templateManager } from '../src/board/templates';
import {
  applyElementToItem,
  applyShapeElement,
  applyTextElement,
} from '../src/board/element-utils';

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
        applyShapeElement(shape as unknown as Record<string, unknown>, el, 'L');
        return shape;
      });
    await builder.createNode(
      { id: 'n', label: 'L', type: 'fill' } as unknown as Record<
        string,
        unknown
      >,
      { x: 0, y: 0, width: 1, height: 1 },
    );
    // The fill color from the element should be applied
    expect(shape.style.fillColor).toBe('#fff');
  });

  test('applyTextElement merges style when provided', () => {
    const item: Record<string, unknown> = {
      type: 'text',
      style: { fontSize: 10 },
    };
    const el = { text: 'T', style: { color: 'red' } } as Record<
      string,
      unknown
    >;
    // Applying a text element should merge the style properties
    applyTextElement(item as unknown as Record<string, unknown>, el, 'L');
    expect(item.style.color).toBe('red');
    expect(item.style.fontSize).toBe(10);
  });

  test('createEdges skips edges with missing nodes', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        createConnector: jest
          .fn()
          .mockResolvedValue({
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
    global.miro = { board: { get: jest.fn().mockResolvedValue([group]) } };
    const result = await searchGroups(
      global.miro
        .board as unknown as import('../src/board/board').BoardQueryLike,
      'Role',
      'A',
    );
    expect(result).toBeUndefined();
  });

  test('updateConnector handles missing template and hints', () => {
    const connector: Record<string, unknown> = { style: {}, shape: 'curved' };
    updateConnector(
      connector as unknown as import('@mirohq/websdk-types').Connector,
      { from: 'a', to: 'b' } as unknown as import('../src/core/graph').EdgeData,
      undefined,
      undefined,
    );
    expect(connector.shape).toBe('curved');
    expect(connector.style).toEqual({});
  });

  test('searchShapes returns undefined when no shapes match', async () => {
    global.miro = { board: { get: jest.fn().mockResolvedValue([]) } };
    const result = await searchShapes(
      global.miro
        .board as unknown as import('../src/board/board').BoardQueryLike,
      undefined,
      'A',
    );
    expect(result).toBeUndefined();
  });

  test('applyShapeElement preserves existing fillColor', () => {
    const item: Record<string, unknown> = {
      type: 'shape',
      style: { fillColor: '#abc' },
    };
    const el = { shape: 'rect', fill: '#fff', width: 1, height: 1 };
    applyShapeElement(item as unknown as Record<string, unknown>, el, 'L');
    expect(item.style.fillColor).toBe('#abc');
  });

  test('applyElementToItem handles text widgets', () => {
    const item: Record<string, unknown> = { type: 'text', style: {} };
    const el = { text: 'Name' } as Record<string, unknown>;
    applyElementToItem(item as unknown as Record<string, unknown>, el, 'Label');
    expect(item.content).toBe('Name');
  });

  test('updateConnector applies hint positions', () => {
    const connector: Record<string, unknown> = { style: {}, shape: 'curved' };
    updateConnector(
      connector as unknown as import('@mirohq/websdk-types').Connector,
      {
        from: 'a',
        to: 'b',
        label: 'L',
      } as unknown as import('../src/core/graph').EdgeData,
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
    const edge = { from: 'n1', to: 'n2' } as Record<string, unknown>;
    const result = await createConnector(
      edge as unknown as import('../src/core/graph').EdgeData,
      { id: 'a' } as unknown as import('@mirohq/websdk-types').BaseItem,
      { id: 'b' } as unknown as import('@mirohq/websdk-types').BaseItem,
      undefined,
      undefined,
    );
    const args = board.createConnector.mock.calls[0][0];
    expect(args.captions).toBeUndefined();
    expect(result).toBeDefined();
  });
});
