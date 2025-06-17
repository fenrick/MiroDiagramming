import { createNode, resetBoardCache } from '../src/graph';
import * as templateModule from '../src/templates';

declare const global: any;

describe('createNode', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([])
      }
    };
    jest.spyOn(templateModule, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: jest.fn(),
      getMetadata: jest.fn(),
      getItems: jest.fn().mockResolvedValue([]),
      sync: jest.fn(),
      id: 's1'
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetBoardCache();
  });

  const node = { id: 'n1', label: 'L', type: 'Role' } as any;
  const pos = { x: 0, y: 0, width: 10, height: 10 };

  test('creates new node', async () => {
    const res = await createNode(node, pos);
    expect(res).toBeDefined();
  });
});
