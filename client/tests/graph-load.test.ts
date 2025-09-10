import { defaultBuilder, graphService } from '../src/core/graph';

interface ReaderEvent {
  target: { result?: string | null } | null;
}

/**
 * Tests for the loadGraph helper which parses an uploaded file
 * and resets builder state.
 */

describe('loadGraph', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as { FileReader?: unknown }).FileReader;
  });

  test('parses valid file and resets cache', async () => {
    const resetSpy = vi.spyOn(defaultBuilder, 'reset');

    // Minimal FileReader mock that returns valid graph JSON
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsText() {
        if (this.onload) {
          const evt = {
            target: { result: '{"nodes":[],"edges":[]}' },
          } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    const file = { name: 'graph.json' } as unknown as File;
    const data = await graphService.loadGraph(file);
    // Parsed graph should be returned and builder reset
    expect(data).toEqual({ nodes: [], edges: [] });
    expect(resetSpy).toHaveBeenCalled();
  });

  test('throws on invalid file object', async () => {
    // Passing a null file should throw a validation error
    await expect(
      graphService.loadGraph(null as unknown as File),
    ).rejects.toThrow('Invalid file');
  });

  test('throws on invalid graph data', async () => {
    // FileReader returns non-object JSON which should fail
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;

      readAsText() {
        if (this.onload) {
          const evt = { target: { result: '[]' } } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    await expect(
      graphService.loadGraph({ name: 'a.json' } as unknown as File),
    ).rejects.toThrow('Invalid graph data');
  });

  test('rejects when FileReader has no target', async () => {
    // Simulate missing target in FileReader event
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null;

      readAsText() {
        if (this.onload) {
          const evt = { target: null } as ReaderEvent;
          this.onload(evt);
        }
      }
    }

    (global as { FileReader?: unknown }).FileReader = FR;
    await expect(
      graphService.loadGraph({ name: 'bad.json' } as unknown as File),
    ).rejects.toEqual(new Error('Failed to load file'));
  });
});
