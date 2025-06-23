import { BoardBuilder } from '../src/board/BoardBuilder';
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

  test('findConnector validates parameters', async () => {
    const builder = new BoardBuilder();
    // Null id should trigger validation error
    await expect(
      builder.findConnector('a', null as unknown as string),
    ).rejects.toThrow('Invalid search parameters');
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
      .mockReturnValue({ elements: [{ shape: 'r' }, { text: 't' }] });
    const builder = new BoardBuilder();
    // Ensure a fresh node is created rather than updated
    jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    const node = { id: 'n1', label: 'A', type: 'multi' } as Record<
      string,
      unknown
    >;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const result = await builder.createNode(node, pos);
    expect(result.type).toBe('group');
    // Metadata should be written to child items
    expect(items[0].setMetadata).toHaveBeenCalled();
  });

  test('updateExistingNode for group', async () => {
    const itemMocks = [
      { setMetadata: jest.fn(), type: 'shape' },
      { setMetadata: jest.fn(), type: 'text' },
    ];
    const group = {
      type: 'group',
      getItems: jest.fn().mockResolvedValue(itemMocks),
    } as Record<string, unknown>;
    const builder = new BoardBuilder();
    // findNode returns an existing group for the node
    jest.spyOn(builder, 'findNode').mockResolvedValue(group);
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue({ elements: [{ shape: 's' }, { text: 't' }] });
    const node = { id: 'n', label: 'L', type: 'Role' } as Record<
      string,
      unknown
    >;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const result = await builder.createNode(node, pos);
    // The existing group is returned and updated
    expect(result).toBe(group);
    expect(itemMocks[0].setMetadata).toHaveBeenCalled();
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
