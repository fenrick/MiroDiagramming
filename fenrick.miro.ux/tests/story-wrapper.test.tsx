/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelStoryWrapper } from '../src/stories/ExcelStoryWrapper';
import { useExcelData } from '../src/ui/hooks/excel-data-context';

declare const global: {
  miro?: { board?: { getSelection: () => Promise<unknown> } };
};

function ShowFirstName(): JSX.Element {
  const ctx = useExcelData();
  return <span>{String(ctx?.rows[0]?.Name)}</span>;
}

describe('ExcelStoryWrapper', () => {
  test('provides context and stubs miro board', async () => {
    render(
      <ExcelStoryWrapper rows={[{ ID: '1', Name: 'Bob' }]}>
        <ShowFirstName />
      </ExcelStoryWrapper>,
    );
    expect(screen.getByText('Bob')).toBeInTheDocument();
    const items = await global.miro!.board!.getSelection();
    // @ts-expect-error testing stub
    const meta = await items[0].getMetadata();
    expect(meta.rowId).toBe('1');
  });
});
