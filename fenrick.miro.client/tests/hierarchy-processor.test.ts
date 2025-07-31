import { templateManager } from '../src/board/templates';
import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('HierarchyProcessor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('processFile loads data and delegates', async () => {
    const proc = new HierarchyProcessor();
    const spy = jest
      .spyOn(
        proc as unknown as {
          processHierarchy: (r: unknown, o?: unknown) => Promise<void>;
        },
        'processHierarchy',
      )
      .mockResolvedValue();
    const file = {
      name: 'h.json',
      text: jest
        .fn()
        .mockResolvedValue('[{"id":"n","label":"L","type":"Motivation"}]'),
    } as unknown as File;
    await proc.processFile(file);
    expect(spy).toHaveBeenCalledWith(
      [{ id: 'n', label: 'L', type: 'Motivation' }],
      {},
    );
  });

  test('processHierarchy creates widgets and zooms', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: jest.fn(),
        },
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
      },
    };
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getItems: jest.fn().mockResolvedValue([]),
        sync: jest.fn(),
        id: 's1',
      } as unknown);
    const proc = new HierarchyProcessor();
    await proc.processHierarchy([{ id: 'n', label: 'L', type: 'Motivation' }]);
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });

  test('processHierarchy groups parent and children', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: jest.fn(),
        },
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
        group: jest.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
      },
    } as unknown as GlobalWithMiro;
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getItems: jest.fn().mockResolvedValue([]),
        sync: jest.fn(),
        id: 's1',
      } as unknown);
    const proc = new HierarchyProcessor();
    await proc.processHierarchy([
      {
        id: 'p',
        label: 'Parent',
        type: 'Motivation',
        children: [{ id: 'c', label: 'Child', type: 'Motivation' }],
      },
    ]);
    expect(
      (global.miro.board.group as jest.Mock).mock.calls[0][0].items.length,
    ).toBe(2);
  });
});
