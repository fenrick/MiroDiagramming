import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { ExcelSyncService } from '../src/core/excel-sync-service';
import { ExcelDataProvider } from '../src/ui/hooks/excel-data-context';
import { useExcelSync } from '../src/ui/hooks/use-excel-sync';

vi.mock('../src/core/excel-sync-service');

const rows = [{ ID: '1', Name: 'A' }];

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ExcelDataProvider
      value={{
        rows,
        idColumn: 'ID',
        labelColumn: 'Name',
        templateColumn: undefined,
        setRows: vi.fn(),
        setIdColumn: vi.fn(),
        setLabelColumn: vi.fn(),
        setTemplateColumn: vi.fn(),
      }}>
      {children}
    </ExcelDataProvider>
  );
}

describe('useExcelSync', () => {
  beforeEach(() =>
    (ExcelSyncService as unknown as vi.Mock).mockImplementation(() => ({
      updateShapesFromExcel: vi.fn().mockResolvedValue(undefined),
    })),
  );

  test('updates rows and widgets', async () => {
    const { result } = renderHook(() => useExcelSync(), { wrapper });
    await act(async () => await result.current(0, { ID: '1', Name: 'B' }));
    const svc = (ExcelSyncService as unknown as vi.Mock).mock.results.at(-1)
      ?.value as { updateShapesFromExcel: vi.Mock };
    expect(svc.updateShapesFromExcel).toHaveBeenCalled();
  });

  test('returns early when context missing', async () => {
    const { result } = renderHook(() => useExcelSync());
    await act(async () => await result.current(0, { ID: '1', Name: 'B' }));
    const svc = (ExcelSyncService as unknown as vi.Mock).mock.results.at(-1)
      ?.value as { updateShapesFromExcel: vi.Mock };
    expect(svc.updateShapesFromExcel).not.toHaveBeenCalled();
  });
});
