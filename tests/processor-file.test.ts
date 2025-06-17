import { GraphProcessor } from '../src/GraphProcessor';
import * as graph from '../src/graph';

describe('GraphProcessor.processFile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('throws on invalid file', async () => {
    const gp = new GraphProcessor();
    await expect(gp.processFile(null as any)).rejects.toThrow('Invalid file');
  });

  test('loads graph then processes it', async () => {
    const gp = new GraphProcessor();
    const mockGraph = { nodes: [], edges: [] } as any;
    jest.spyOn(graph, 'loadGraph').mockResolvedValue(mockGraph);
    const processSpy = jest.spyOn(gp as any, 'processGraph').mockResolvedValue(undefined);
    const file = { name: 'g.json' } as any;
    await gp.processFile(file);
    expect(graph.loadGraph).toHaveBeenCalledWith(file);
    expect(processSpy).toHaveBeenCalledWith(mockGraph, {});
  });
});
