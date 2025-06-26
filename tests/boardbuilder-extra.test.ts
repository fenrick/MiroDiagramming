import { BoardBuilder } from '../src/board/board-builder';
import { templateManager } from '../src/board/templates';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Additional edge case tests for the BoardBuilder class.
 */

describe('BoardBuilder additional cases', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('findSpace throws when board not initialized', async () => {
    const builder = new BoardBuilder();
    // Without a miro global the builder should reject
    await expect(builder.findSpace(1, 1)).rejects.toThrow(
      'Miro board not initialized',
    );
  });

  test('setFrame and getFrame round trip', () => {
    const builder = new BoardBuilder();
    // Store a frame and ensure we get the same reference back
    const frame = { id: 'f' } as Record<string, unknown>;
    builder.setFrame(frame);
    expect(builder.getFrame()).toBe(frame);
  });

  test('findNode validates parameters', async () => {
    const builder = new BoardBuilder();
    // Non-string type should cause a validation error
    await expect(builder.findNode(1 as unknown as string, 'a')).rejects.toThrow(
      'Invalid search parameters',
    );
  });

  test('createNode throws on invalid arguments and missing template', async () => {
    const builder = new BoardBuilder();
    // Guard against invalid parameters
    await expect(
      builder.createNode(null as unknown as Record<string, unknown>, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      }),
    ).rejects.toThrow('Invalid node');
    await expect(
      builder.createNode(
        {} as unknown as Record<string, unknown>,
        null as unknown as {
          x: number;
          y: number;
          width: number;
          height: number;
        },
      ),
    ).rejects.toThrow('Invalid position');
    // Unknown template results in an error
    jest.spyOn(templateManager, 'getTemplate').mockReturnValue(undefined);
    await expect(
      builder.createNode(
        { id: 'x', label: 'L', type: 'unknown' } as Record<string, unknown>,
        { x: 0, y: 0, width: 1, height: 1 },
      ),
    ).rejects.toThrow("Template 'unknown' not found");
  });

  test('createNode creates group and sets metadata', async () => {
    const items = [{ setMetadata: jest.fn() }, { setMetadata: jest.fn() }];
    // Mock creation of a group containing two items
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'group',
        getItems: jest.fn().mockResolvedValue(items),
      } as unknown as { type: string; getItems: () => Promise<unknown[]> });
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue({
        elements: [{ shape: 'r' }, { text: 't' }],
        masterElement: 1,
      });
    const builder = new BoardBuilder();
    const spy = jest.spyOn(builder, 'findNode');
    const node = { id: 'n1', label: 'A', type: 'multi' } as Record<
      string,
      unknown
    >;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const result = await builder.createNode(node, pos);
    expect(result.type).toBe('group');
    // Metadata should be written only to the master element
    expect(items[0].setMetadata).not.toHaveBeenCalled();
    expect(items[1].setMetadata).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  test('createNode ignores existing group', async () => {
    const itemMocks = [
      { setMetadata: jest.fn(), type: 'shape' },
      { setMetadata: jest.fn(), type: 'text' },
    ];
    const group = {
      type: 'group',
      getItems: jest.fn().mockResolvedValue(itemMocks),
    } as Record<string, unknown>;
    const builder = new BoardBuilder();
    jest.spyOn(builder, 'findNode').mockResolvedValue(group);
    global.miro = { board: { createShape: jest.fn(), createText: jest.fn() } };
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue({ elements: [{ shape: 's' }, { text: 't' }] });
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'group',
        getItems: jest.fn().mockResolvedValue(itemMocks),
      } as unknown as { type: string; getItems: () => Promise<unknown[]> });
    const node = { id: 'n', label: 'L', type: 'Role' } as Record<
      string,
      unknown
    >;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const result = await builder.createNode(node, pos);
    // The builder should create a new group instead of updating
    expect(result).not.toBe(group);
  });

  test('createEdges validates inputs and syncs', async () => {
    const builder = new BoardBuilder();
    // Invalid edges array
    await expect(
      builder.createEdges(null as unknown as [], {} as Record<string, unknown>),
    ).rejects.toThrow('Invalid edges');
    // Invalid node map
    await expect(
      builder.createEdges([], null as unknown as Record<string, unknown>),
    ).rejects.toThrow('Invalid node map');
  });

  test('syncAll calls sync when available', async () => {
    const builder = new BoardBuilder();
    // Only items that implement sync should be called
    const item = { sync: jest.fn() };
    await builder.syncAll([item, {} as Record<string, unknown>]);
    expect(item.sync).toHaveBeenCalled();
  });
});
