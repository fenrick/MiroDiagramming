import { BoardBuilder } from '../src/BoardBuilder';
import * as templates from '../src/templates';

/**
 * Additional edge case tests for the BoardBuilder class.
 */

describe('BoardBuilder additional cases', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('findSpace throws when board not initialized', async () => {
    const builder = new BoardBuilder();
    // Without a miro global the builder should reject
    await expect(builder.findSpace(1, 1)).rejects.toThrow(
      'Miro board not initialized'
    );
  });

  test('setFrame and getFrame round trip', () => {
    const builder = new BoardBuilder();
    // Store a frame and ensure we get the same reference back
    const frame = { id: 'f' } as any;
    builder.setFrame(frame);
    expect(builder.getFrame()).toBe(frame);
  });

  test('findNode validates parameters', async () => {
    const builder = new BoardBuilder();
    // Non-string type should cause a validation error
    await expect(builder.findNode(1 as any, 'a')).rejects.toThrow(
      'Invalid search parameters'
    );
  });

  test('findConnector validates parameters', async () => {
    const builder = new BoardBuilder();
    // Null id should trigger validation error
    await expect(builder.findConnector('a', null as any)).rejects.toThrow(
      'Invalid search parameters'
    );
  });

  test('createNode throws on invalid arguments and missing template', async () => {
    const builder = new BoardBuilder();
    // Guard against invalid parameters
    await expect(
      builder.createNode(null as any, { x: 0, y: 0, width: 1, height: 1 })
    ).rejects.toThrow('Invalid node');
    await expect(builder.createNode({} as any, null as any)).rejects.toThrow(
      'Invalid position'
    );
    // Unknown template results in an error
    jest.spyOn(templates, 'getTemplate').mockReturnValue(undefined);
    await expect(
      builder.createNode({ id: 'x', label: 'L', type: 'unknown' } as any, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      })
    ).rejects.toThrow("Template 'unknown' not found");
  });

  test('createNode creates group and sets metadata', async () => {
    const items = [{ setMetadata: jest.fn() }, { setMetadata: jest.fn() }];
    // Mock creation of a group containing two items
    jest.spyOn(templates, 'createFromTemplate').mockResolvedValue({
      type: 'group',
      getItems: jest.fn().mockResolvedValue(items),
    } as any);
    jest
      .spyOn(templates, 'getTemplate')
      .mockReturnValue({ elements: [{ shape: 'r' }, { text: 't' }] });
    const builder = new BoardBuilder();
    // Ensure a fresh node is created rather than updated
    jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    const node = { id: 'n1', label: 'A', type: 'multi' } as any;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const res = await builder.createNode(node, pos);
    expect(res.type).toBe('group');
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
    } as any;
    const builder = new BoardBuilder();
    // findNode returns an existing group for the node
    jest.spyOn(builder, 'findNode').mockResolvedValue(group);
    jest
      .spyOn(templates, 'getTemplate')
      .mockReturnValue({ elements: [{ shape: 's' }, { text: 't' }] });
    const node = { id: 'n', label: 'L', type: 'Role' } as any;
    const pos = { x: 0, y: 0, width: 1, height: 1 };
    const res = await builder.createNode(node, pos);
    // The existing group is returned and updated
    expect(res).toBe(group);
    expect(itemMocks[0].setMetadata).toHaveBeenCalled();
  });

  test('createEdges validates inputs and syncs', async () => {
    const builder = new BoardBuilder();
    // Invalid edges array
    await expect(builder.createEdges(null as any, {} as any)).rejects.toThrow(
      'Invalid edges'
    );
    // Invalid node map
    await expect(builder.createEdges([], null as any)).rejects.toThrow(
      'Invalid node map'
    );
  });

  test('syncAll calls sync when available', async () => {
    const builder = new BoardBuilder();
    // Only items that implement sync should be called
    const item = { sync: jest.fn() };
    await builder.syncAll([item, {} as any]);
    expect(item.sync).toHaveBeenCalled();
  });
});
