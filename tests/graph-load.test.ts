import { loadGraph, defaultBuilder } from '../src/graph';

/**
 * Tests for the loadGraph helper which parses an uploaded file
 * and resets builder state.
 */

describe('loadGraph', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).FileReader;
  });

  test('parses valid file and resets cache', async () => {
    const resetSpy = jest.spyOn(defaultBuilder, 'reset');
    // Minimal FileReader mock that returns valid graph JSON
    class FR {
      onload: ((e: any) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        this.onload &&
          this.onload({ target: { result: '{"nodes":[],"edges":[]}' } });
      }
    }
    (global as any).FileReader = FR;
    const file = { name: 'graph.json' } as any;
    const data = await loadGraph(file);
    // Parsed graph should be returned and builder reset
    expect(data).toEqual({ nodes: [], edges: [] });
    expect(resetSpy).toHaveBeenCalled();
  });

  test('throws on invalid file object', async () => {
    // Passing a null file should throw a validation error
    await expect(loadGraph(null as any)).rejects.toThrow('Invalid file');
  });

  test('throws on invalid graph data', async () => {
    // FileReader returns non-object JSON which should fail
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: { result: '[]' } });
      }
    }
    (global as any).FileReader = FR;
    await expect(loadGraph({ name: 'a.json' } as any)).rejects.toThrow(
      'Invalid graph data',
    );
  });

  test('rejects when FileReader has no target', async () => {
    // Simulate missing target in FileReader event
    class FR {
      onload: ((e: any) => void) | null = null;
      readAsText() {
        this.onload && this.onload({ target: null });
      }
    }
    (global as any).FileReader = FR;
    await expect(loadGraph({ name: 'bad.json' } as any)).rejects.toBe(
      'Failed to load file',
    );
  });
});
