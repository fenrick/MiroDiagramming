import { describe, expect, test } from 'vitest';
import {
  buildMetadata,
  mapRowsToCards,
  mapRowsToNodes,
  mapRowsWith,
  mapRowToCard,
  mapRowToNode,
  resolveIdLabelType,
} from '../src/core/data-mapper';

describe('data mapper', () => {
  test('maps rows to nodes with metadata', () => {
    const rows = [
      { ID: '1', Type: 'Motivation', Name: 'A', Note: 'n', Extra: 'x' },
    ];
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
        type: 'Motivation',
        metadata: { text: 'n', extra: 'x', rowId: '1' },
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

  test('row helper functions map single entries', () => {
    const row = { ID: '7', Title: 'One', Theme: 'red' };
    const opts = {
      idColumn: 'ID',
      labelColumn: 'Title',
      templateColumn: 'Theme',
    } as const;
    expect(resolveIdLabelType(row, opts, 0)).toEqual({
      id: '7',
      label: 'One',
      type: 'red',
    });
    expect(buildMetadata(row, opts, 0)).toEqual({ rowId: '7' });
    expect(mapRowToNode(row, opts, 0)).toEqual({
      id: '7',
      label: 'One',
      type: 'red',
      metadata: { rowId: '7' },
    });
    expect(mapRowToCard(row, opts)).toEqual({
      id: '7',
      title: 'One',
      style: { cardTheme: 'red' },
    });
  });

  test('mapRowToCard omits undefined fields', () => {
    const row = { Title: 'Only Title' };
    const opts = { labelColumn: 'Title' } as const;
    expect(mapRowToCard(row, opts)).toEqual({ title: 'Only Title' });
  });

  test('mapRowsWith delegates mapping logic', () => {
    const rows = [{ id: '1' }, { id: '2' }];
    const ids = mapRowsWith(rows, {}, r => r.id as string);
    expect(ids).toEqual(['1', '2']);
  });
});
