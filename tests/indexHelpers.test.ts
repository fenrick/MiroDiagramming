import {
  processJson,
  handleFileInput,
  setupDragAndDrop,
} from '../src/logic/indexHelpers';
import * as parser from '../src/logic/inputParser';
import * as layout from '../src/logic/layoutEngine';
import * as shapes from '../src/logic/shapeRenderer';
import * as edges from '../src/logic/edgeRenderer';

jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('processJson', () => {
  test('invokes helpers in order', async () => {
    const calls: string[] = [];
    jest.spyOn(parser, 'parseGraph').mockImplementation(() => {
      calls.push('parseGraph');
      return 'graph' as any;
    });
    jest.spyOn(layout, 'runLayout').mockImplementation(async () => {
      calls.push('runLayout');
      return { nodes: [], edges: [] } as any;
    });
    jest.spyOn(shapes, 'renderNodes').mockImplementation(async () => {
      calls.push('renderNodes');
      return {} as any;
    });
    jest.spyOn(edges, 'renderEdges').mockImplementation(async () => {
      calls.push('renderEdges');
    });

    await processJson({});
    expect(calls).toEqual([
      'parseGraph',
      'runLayout',
      'renderNodes',
      'renderEdges',
    ]);
  });
});

describe('handleFileInput', () => {
  test('reads file and triggers parsing', async () => {
    const file = {
      text: jest.fn().mockResolvedValue('{"nodes":[],"edges":[]}'),
      type: 'application/json',
      name: 'test.json',
      lastModified: Date.now(),
      size: 100,
    };
    const evt = { target: { files: [file] } } as unknown as Event;
    jest.spyOn(parser, 'parseGraph').mockReturnValue({} as any);
    jest.spyOn(layout, 'runLayout').mockResolvedValue({ nodes: [], edges: [] });
    jest.spyOn(shapes, 'renderNodes').mockResolvedValue({});
    jest.spyOn(edges, 'renderEdges').mockResolvedValue(undefined);

    await handleFileInput(evt);
    await Promise.resolve(); // Ensure all promises resolve

    expect(file.text).toHaveBeenCalled();
    expect(parser.parseGraph).toHaveBeenCalledWith({ nodes: [], edges: [] });
  });

  test('ignores when no file is present', () => {
    const evt = { target: { files: [] } } as unknown as Event;
    const parseSpy = jest.spyOn(parser, 'parseGraph');
    handleFileInput(evt);
    expect(parseSpy).not.toHaveBeenCalled();
  });

  test('errors on unsupported file type', async () => {
    const file = {
      text: jest.fn().mockResolvedValue('{"nodes":[],"edges":[]}'),
      type: 'application/json',
      name: 'test.json',
      lastModified: Date.now(),
      size: 100,
    };
    const evt = { target: { files: [file] } } as unknown as Event;
    const errorSpy = jest.spyOn(console, 'error');

    await handleFileInput(evt);
    expect(file.text).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'Unsupported file type',
      'text/plain'
    );
  });
});

describe('setupDragAndDrop', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
    jest.restoreAllMocks();
  });

  test('adds listeners and handles events', async () => {
    const listeners: Record<string, any> = {};
    const addEventListener = jest.fn((t: string, l: any) => {
      listeners[t] = l;
    });
    const removeEventListener = jest.fn();
    globalThis.window = {
      addEventListener,
      removeEventListener,
    } as any;

    jest.spyOn(parser, 'parseGraph').mockReturnValue({} as any);
    jest.spyOn(layout, 'runLayout').mockResolvedValue({ nodes: [], edges: [] });
    jest.spyOn(shapes, 'renderNodes').mockResolvedValue({});
    jest.spyOn(edges, 'renderEdges').mockResolvedValue(undefined);

    const cleanup = setupDragAndDrop();

    expect(addEventListener).toHaveBeenCalledWith(
      'dragover',
      expect.any(Function)
    );
    expect(addEventListener).toHaveBeenCalledWith('drop', expect.any(Function));

    const dragEvt = { preventDefault: jest.fn() } as unknown as DragEvent;
    listeners.dragover(dragEvt);
    expect(dragEvt.preventDefault).toHaveBeenCalled();

    const file = {
      text: jest.fn().mockResolvedValue('{"nodes":[],"edges":[]}'),
      type: 'application/json',
      name: 'test.json',
      lastModified: Date.now(),
      size: 100,
    };
    const dropEvt = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [file] },
    } as unknown as DragEvent;
    await listeners.drop(dropEvt);
    expect(dropEvt.preventDefault).toHaveBeenCalled();
    expect(file.text).toHaveBeenCalled();
    expect(parser.parseGraph).toHaveBeenCalledWith({ nodes: [], edges: [] });

    expect(removeEventListener).toHaveBeenCalledWith(
      'dragover',
      listeners.dragover
    );
    expect(removeEventListener).toHaveBeenCalledWith('drop', listeners.drop);
  });

  test('errors when dropped file has wrong type', async () => {
    const listeners: Record<string, any> = {};
    globalThis.window = {
      addEventListener: jest.fn((t: string, l: any) => {
        listeners[t] = l;
      }),
      removeEventListener: jest.fn(),
    } as any;

    const cleanup = setupDragAndDrop();

    const errorSpy = jest.spyOn(console, 'error');
    const file = { text: jest.fn(), type: 'text/plain', name: 'test.txt' };
    const dropEvt = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [file] },
    } as unknown as DragEvent;

    await listeners.drop(dropEvt);
    expect(dropEvt.preventDefault).toHaveBeenCalled();
    expect(file.text).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('Unsupported file type', 'test.txt');
  });
});
