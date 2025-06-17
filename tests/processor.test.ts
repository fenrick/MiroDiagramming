import { GraphProcessor } from '../src/GraphProcessor';
import { resetBoardCache } from '../src/graph';
import * as templateModule from '../src/templates';
import sample from '../sample-graph.json';

declare const global: any;

describe('GraphProcessor', () => {
  const processor = new GraphProcessor();

  beforeEach(() => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        createConnector: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1'
        }),
        createShape: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 's1',
          type: 'shape'
        }),
        createText: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 't1',
          type: 'text'
        }),
        group: jest.fn().mockResolvedValue({
          type: 'group',
          getItems: jest.fn().mockResolvedValue([]),
          setMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'g1'
        })
      }
    };
    resetBoardCache();
    jest.spyOn(templateModule, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: jest.fn(),
      getMetadata: jest.fn(),
      getItems: jest.fn(),
      sync: jest.fn(),
      id: 's1'
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetBoardCache();
  });

  it('processGraph runs without throwing and syncs items', async () => {
    await processor.processGraph(sample as any);
  });
  it('throws on invalid graph', async () => {
    await expect(processor.processGraph({} as any)).rejects.toThrow('Invalid graph');
  });
});
