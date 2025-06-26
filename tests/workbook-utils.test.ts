/** @vitest-environment jsdom */
import { describe, test, expect, vi } from 'vitest';
import {
  addMiroIds,
  downloadWorkbook,
} from '../src/core/utils/workbook-writer';

describe('workbook writer', () => {
  test('adds ids to rows', () => {
    const rows = [{ ID: '1', Name: 'A' }];
    const result = addMiroIds(rows, 'ID', { '1': 'w1' });
    expect(result[0].MiroId).toBe('w1');
  });

  test('downloadWorkbook triggers anchor click', () => {
    const rows = [{ ID: '1' }];
    const anchor = {
      click: vi.fn(),
      href: '',
      download: '',
    } as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const createSpy = URL.createObjectURL
      ? vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')
      : ((URL.createObjectURL = vi.fn(() => 'blob:1')) as unknown as vi.Mock);
    if (URL.revokeObjectURL) {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    } else {
      URL.revokeObjectURL = vi.fn();
    }
    downloadWorkbook(rows, 'f.xlsx');
    expect(anchor.download).toBe('f.xlsx');
    expect(anchor.click).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();
  });
});
