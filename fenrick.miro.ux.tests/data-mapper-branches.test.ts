import { describe, expect, test } from 'vitest';
import {
  mapRowsToNodes,
  mapRowsToCards,
} from 'fenrick.miro.ux/core/data-mapper';

describe('data-mapper branches', () => {
  test('mapRowsToNodes uses defaults when mapping is empty', () => {
    const rows = [{ Col: 'A' }];
    const result = mapRowsToNodes(rows, {});
    expect(result).toEqual([
      { id: '0', label: '', type: 'default', metadata: { rowId: '0' } },
    ]);
  });

  test('mapRowsToNodes ignores missing optional columns', () => {
    const rows = [{ id: 'a', text: null }];
    const result = mapRowsToNodes(rows, {
      idColumn: 'id',
      textColumn: 'text',
      metadataColumns: { extra: 'missing' },
    });
    expect(result).toEqual([
      { id: 'a', label: '', type: 'default', metadata: { rowId: 'a' } },
    ]);
  });

  test('mapRowsToCards returns minimal card info', () => {
    const rows = [{ X: 1 }];
    const result = mapRowsToCards(rows, {});
    expect(result).toEqual([{ title: '' }]);
  });
});
