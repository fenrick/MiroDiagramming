import { renderHook, act } from '@testing-library/react';
import {
  useRowData,
  extractRowId,
  findRow,
} from '../src/ui/hooks/use-row-data';
import { useSelection } from '../src/ui/hooks/use-selection';
import type { BaseItem, Group } from '@mirohq/websdk-types';

vi.mock('../src/ui/hooks/use-selection');

describe('useRowData', () => {
  test('returns row matching selection metadata', async () => {
    const item: BaseItem = {
      type: 'shape',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '2' }),
    } as unknown as BaseItem;
    (useSelection as unknown as vi.Mock).mockReturnValue([item]);
    const rows = [{ ID: '1' }, { ID: '2' }];
    const { result } = renderHook(() => useRowData(rows, 'ID'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual(rows[1]);
  });

  test('handles group selection', async () => {
    const child1: BaseItem = {
      getMetadata: vi.fn().mockResolvedValue({}),
    } as unknown as BaseItem;
    const child2: BaseItem = {
      getMetadata: vi.fn().mockResolvedValue({ rowId: '1' }),
    } as unknown as BaseItem;
    const group: Group = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue([child1, child2]),
    } as unknown as Group;
    (useSelection as unknown as vi.Mock).mockReturnValue([group]);
    const rows = [{ ID: '1' }];
    const { result } = renderHook(() => useRowData(rows, 'ID'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toEqual(rows[0]);
  });

  test('returns null when metadata missing', async () => {
    const item: BaseItem = {
      type: 'shape',
      getMetadata: vi.fn().mockRejectedValue(new Error('fail')),
    } as unknown as BaseItem;
    (useSelection as unknown as vi.Mock).mockReturnValue([item]);
    const { result } = renderHook(() => useRowData([{ ID: '1' }], 'ID'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toBeNull();
  });
});

describe('helpers', () => {
  test('extractRowId reads metadata from groups', async () => {
    const a: BaseItem = {
      getMetadata: vi.fn().mockResolvedValue({}),
    } as unknown as BaseItem;
    const b: BaseItem = {
      getMetadata: vi.fn().mockResolvedValue({ rowId: '5' }),
    } as unknown as BaseItem;
    const group: Group = {
      type: 'group',
      getItems: vi.fn().mockResolvedValue([a, b]),
    } as unknown as Group;
    await expect(extractRowId(group)).resolves.toBe('5');
  });

  test('findRow locates by id column or index', () => {
    const rows = [{ ID: '1' }, { ID: '2' }];
    expect(findRow(rows, 'ID', '2')).toEqual(rows[1]);
    expect(findRow(rows, undefined, '1')).toEqual(rows[1]);
    expect(findRow(rows, 'ID', '3')).toBeNull();
  });

  test('extractRowId handles simple item', async () => {
    const item: BaseItem = {
      type: 'shape',
      getMetadata: vi.fn().mockResolvedValue({ rowId: '9' }),
    } as unknown as BaseItem;
    await expect(extractRowId(item)).resolves.toBe('9');
  });
});
