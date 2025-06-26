import { describe, test, expect } from 'vitest';
import { mapRowsToNodes, mapRowsToCards } from '../src/core/data-mapper';

describe('data mapper', () => {
  test('maps rows to nodes with metadata', () => {
    const rows = [{ ID: '1', Type: 'Role', Name: 'A', Note: 'n', Extra: 'x' }];
    const opts = {
      idColumn: 'ID',
      templateColumn: 'Type',
      labelColumn: 'Name',
      textColumn: 'Note',
      metadataColumns: { extra: 'Extra' },
    } as const;
    const result = mapRowsToNodes(rows, opts);
    expect(result).toEqual([
      {
        id: '1',
        label: 'A',
        type: 'Role',
        metadata: { text: 'n', extra: 'x' },
      },
    ]);
  });

  test('maps rows to cards with style', () => {
    const rows = [{ ID: 'a', Title: 'T', Desc: 'D', Theme: 'blue' }];
    const opts = {
      idColumn: 'ID',
      labelColumn: 'Title',
      textColumn: 'Desc',
      templateColumn: 'Theme',
    } as const;
    const result = mapRowsToCards(rows, opts);
    expect(result).toEqual([
      { id: 'a', title: 'T', description: 'D', style: { cardTheme: 'blue' } },
    ]);
  });
});
