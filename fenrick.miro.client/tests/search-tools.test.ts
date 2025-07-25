import { boardCache } from '../src/board/board-cache';
import {
  getTextFields,
  replaceBoardContent,
  searchBoardContent,
} from '../src/board/search-tools';

beforeEach(() => boardCache.reset());

const makeBoard = () => {
  const items = [
    {
      type: 'shape',
      text: 'Hello world',
      tagIds: ['t1'],
      style: { fillColor: '#fff' },
      assigneeId: 'u1',
      createdBy: 'c1',
      lastModifiedBy: 'm1',
      sync: jest.fn(),
    },
    {
      type: 'card',
      title: 'hello there',
      tagIds: ['t2'],
      style: { backgroundColor: '#000' },
      assignee: 'u2',
      createdBy: 'c2',
      lastModifiedBy: 'm2',
      sync: jest.fn(),
    },
    {
      type: 'sticky_note',
      plainText: 'Foo Bar',
      tagIds: ['t1', 't2'],
      style: { fillColor: '#00f' },
      createdBy: 'c3',
      lastModifiedBy: 'm3',
      sync: jest.fn(),
    },
    {
      type: 'shape',
      text: { plainText: 'hxllo test' },
      style: { fillColor: '#0f0' },
      createdBy: 'c1',
      lastModifiedBy: 'm2',
      sync: jest.fn(),
    },
    {
      type: 'text',
      content: 'Hello <b>World</b>',
      style: { backgroundColor: '#fff' },
      createdBy: 'c1',
      lastModifiedBy: 'm3',
      sync: jest.fn(),
    },
    {
      type: 'shape',
      plainText: 'ahellob',
      tagIds: ['t3'],
      style: { fillColor: '#123' },
      assigneeId: 'u1',
      createdBy: 'c4',
      lastModifiedBy: 'm1',
      sync: jest.fn(),
    },
  ];
  const board: BoardQueryLike = {
    getSelection: jest.fn().mockResolvedValue(items.slice(0, 2)),
    get: jest.fn(async ({ type }) =>
      type === 'widget' ? items : items.filter(i => i.type === type),
    ),
  } as unknown as BoardQueryLike;
  return { board, items };
};

describe('search-tools', () => {
  test('search across item types', async () => {
    const { board, items } = makeBoard();
    const res = await searchBoardContent({ query: 'hello' }, board);
    expect(res.map(r => r.item)).toEqual(
      expect.arrayContaining([items[0], items[1], items[4], items[5]]),
    );
  });

  test('widget type filter', async () => {
    const { board, items } = makeBoard();
    const res = await searchBoardContent(
      { query: 'hello', widgetTypes: ['card'] },
      board,
    );
    expect(res).toHaveLength(1);
    expect(res[0].item).toBe(items[1]);
  });

  test('tag, colour and assignee filters', async () => {
    const { board, items } = makeBoard();
    const byTag = await searchBoardContent(
      { query: 'foo', tagIds: ['t2'] },
      board,
    );
    expect(byTag).toHaveLength(1);
    expect(byTag[0].item).toBe(items[2]);
    const byColour = await searchBoardContent(
      { query: 'hello', backgroundColor: '#fff' },
      board,
    );
    expect(byColour.map(r => r.item)).toEqual(
      expect.arrayContaining([items[0], items[4]]),
    );
    const byAssignee = await searchBoardContent(
      { query: 'hello', assignee: 'u2' },
      board,
    );
    expect(byAssignee).toHaveLength(1);
    expect(byAssignee[0].item).toBe(items[1]);
  });

  test('creator and modifier filters', async () => {
    const { board, items } = makeBoard();
    const byCreator = await searchBoardContent(
      { query: 'hello', creator: 'c4' },
      board,
    );
    expect(byCreator).toHaveLength(1);
    expect(byCreator[0].item).toBe(items[5]);
    const byModifier = await searchBoardContent(
      { query: 'hello', lastModifiedBy: 'm1' },
      board,
    );
    expect(byModifier.map(r => r.item)).toEqual(
      expect.arrayContaining([items[0], items[5]]),
    );
  });

  test('regex and whole-word options', async () => {
    const { board, items } = makeBoard();
    const regex = await searchBoardContent(
      { query: 'h.llo', regex: true, widgetTypes: ['shape'] },
      board,
    );
    expect(regex.map(r => r.item)).toEqual(
      expect.arrayContaining([items[0], items[3], items[5]]),
    );
    const whole = await searchBoardContent(
      { query: 'hello', wholeWord: true, widgetTypes: ['shape'] },
      board,
    );
    expect(whole.map(r => r.item)).not.toContain(items[5]);
  });

  test('case sensitivity and selection only', async () => {
    const { board, items } = makeBoard();
    const cs = await searchBoardContent(
      { query: 'Hello', caseSensitive: true, widgetTypes: ['shape'] },
      board,
    );
    expect(cs).toHaveLength(1);
    expect(cs[0].item).toBe(items[0]);
    (board.get as jest.Mock).mockClear();
    const sel = await searchBoardContent(
      { query: 'hello', inSelection: true },
      board,
    );
    expect(board.getSelection).toHaveBeenCalled();
    expect(board.get).not.toHaveBeenCalled();
    expect(sel.map(r => r.item)).toEqual(
      expect.arrayContaining([items[0], items[1]]),
    );
  });

  test('bulk replace preserves formatting', async () => {
    const { board, items } = makeBoard();
    const count = await replaceBoardContent(
      { query: 'hello', replacement: 'hi' },
      board,
    );
    expect(count).toBe(4);
    expect(items[0].text).toBe('hi world');
    expect(items[1].title).toBe('hi there');
    expect(items[4].content).toBe('hi <b>World</b>');
    expect(items[0].sync).toHaveBeenCalled();
  });

  test('onMatch callback is invoked for each replacement', async () => {
    const { board, items } = makeBoard();
    const seen: unknown[] = [];
    const count = await replaceBoardContent(
      { query: 'hello', replacement: 'hi' },
      board,
      i => seen.push(i),
    );
    expect(count).toBe(4);
    expect(seen).toEqual(
      expect.arrayContaining([items[0], items[1], items[4], items[5]]),
    );
  });

  test('regex replacement updates all matching patterns', async () => {
    const { board, items } = makeBoard();
    const count = await replaceBoardContent(
      { query: 'h.llo', replacement: 'hi', regex: true },
      board,
    );
    expect(count).toBe(5);
    expect(items[0].text).toBe('hi world');
    expect(items[1].title).toBe('hi there');
    expect((items[3].text as { plainText: string }).plainText).toBe('hi test');
    expect(items[4].content).toBe('hi <b>World</b>');
    expect(items[5].plainText).toBe('ahib');
  });

  test('search utilities throw without board', async () => {
    await expect(searchBoardContent({ query: 'hi' })).rejects.toThrow(
      'Miro board not available',
    );
    await expect(
      replaceBoardContent({ query: 'hi', replacement: 'bye' }),
    ).rejects.toThrow('Miro board not available');
  });

  test('replaceBoardContent skips widgets lacking text fields', async () => {
    const items = [
      { type: 'shape', sync: jest.fn() },
      { type: 'sticky_note', plainText: 'hello', sync: jest.fn() },
    ];
    const board: BoardQueryLike = {
      getSelection: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue(items),
    } as unknown as BoardQueryLike;
    const count = await replaceBoardContent(
      { query: 'hello', replacement: 'hi' },
      board,
    );
    expect(count).toBe(1);
    expect(items[0].sync).not.toHaveBeenCalled();
    expect(items[1].plainText).toBe('hi');
  });

  test('setStringAtPath guards prototype pollution', async () => {
    const { _setStringAtPath: fn } = (await import(
      '../src/board/search-tools'
    )) as {
      _setStringAtPath: (
        o: Record<string, unknown>,
        p: string,
        v: string,
      ) => void;
    };
    const obj1: Record<string, unknown> = {};
    fn(obj1, '__proto__.polluted', 'yes');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect('polluted' in obj1).toBe(false);

    const obj2: Record<string, unknown> = {};
    fn(obj2, 'constructor.polluted', 'bad');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect('polluted' in obj2).toBe(false);
  });

  test('searchBoardContent rejects invalid regex patterns', async () => {
    const { board } = makeBoard();
    await expect(
      searchBoardContent({ query: '*foo', regex: true }, board),
    ).rejects.toThrow(SyntaxError);
  });

  test('replaceBoardContent rejects invalid regex patterns', async () => {
    const { board } = makeBoard();
    await expect(
      replaceBoardContent(
        { query: '*foo', replacement: 'bar', regex: true },
        board,
      ),
    ).rejects.toThrow(SyntaxError);
  });

  test('searchBoardContent rejects unsafe regex patterns', async () => {
    const { board } = makeBoard();
    await expect(
      searchBoardContent({ query: '(aa+)$', regex: true }, board),
    ).rejects.toThrow('Unsafe regular expression');
  });

  test('replaceBoardContent rejects excessively long patterns', async () => {
    const { board } = makeBoard();
    const pattern = 'a'.repeat(201);
    await expect(
      replaceBoardContent(
        { query: pattern, replacement: 'x', regex: true },
        board,
      ),
    ).rejects.toThrow('Pattern too long');
  });

  test('getTextFields extracts common text properties', () => {
    const item = {
      title: 't',
      content: 'c',
      plainText: 'p',
      description: 'd',
      text: { plainText: 'tp', content: 'tc' },
    };
    const fields = getTextFields(item);
    expect(fields).toEqual([
      ['title', 't'],
      ['content', 'c'],
      ['plainText', 'p'],
      ['description', 'd'],
      ['text.plainText', 'tp'],
      ['text.content', 'tc'],
    ]);
  });
});
