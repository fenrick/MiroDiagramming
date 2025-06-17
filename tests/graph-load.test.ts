import { loadGraph, defaultBuilder } from '../src/graph';

describe('loadGraph', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).FileReader;
  });

  test('parses valid file and resets cache', async () => {
    const resetSpy = jest.spyOn(defaultBuilder, 'reset');
    class FR {
      onload: ((e: any) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: { result: '{"nodes":[],"edges":[]}' } });
      }
    }
    (global as any).FileReader = FR;
    const file = { name: 'graph.json' } as any;
    const data = await loadGraph(file);
    expect(data).toEqual({ nodes: [], edges: [] });
    expect(resetSpy).toHaveBeenCalled();
  });

  test('throws on invalid file object', async () => {
    await expect(loadGraph(null as any)).rejects.toThrow('Invalid file');
  });

  test('throws on invalid graph data', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() { this.onload && this.onload({ target: { result: '[]' } }); }
    }
    (global as any).FileReader = FR;
    await expect(loadGraph({ name: 'a.json' } as any)).rejects.toThrow('Invalid graph data');
  });

  test('rejects when FileReader has no target', async () => {
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() { this.onload && this.onload({ target: null }); }
    }
    (global as any).FileReader = FR;
    await expect(loadGraph({ name: 'bad.json' } as any)).rejects.toBe('Failed to load file');
  });
});
