import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor';
import { templateManager } from '../src/board/templates';

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
    const spy = jest.spyOn(proc as any, 'processHierarchy').mockResolvedValue();
    const file = {
      name: 'h.json',
      text: jest
        .fn()
        .mockResolvedValue('[{"id":"n","label":"L","type":"Role"}]'),
    } as unknown as File;
    await proc.processFile(file);
    expect(spy).toHaveBeenCalledWith(
      [{ id: 'n', label: 'L', type: 'Role' }],
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
    await proc.processHierarchy([{ id: 'n', label: 'L', type: 'Role' }]);
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
  });
});
