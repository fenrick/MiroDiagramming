/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelTab } from '../src/ui/pages/ExcelTab';
import { excelLoader, graphExcelLoader } from '../src/core/utils/excel-loader';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import * as writer from '../src/core/utils/workbook-writer';

vi.mock('../src/core/utils/excel-loader');
vi.mock('../src/core/graph/graph-processor');
vi.mock('../src/core/utils/workbook-writer');

describe('ExcelTab additional paths', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: {
        ui: { on: vi.fn() },
        getSelection: vi.fn().mockResolvedValue([]),
      },
    };
    (excelLoader.loadWorkbook as unknown as vi.Mock).mockResolvedValue(
      undefined,
    );
    (excelLoader.listSheets as unknown as vi.Mock).mockReturnValue(['Sheet1']);
    (excelLoader.listNamedTables as unknown as vi.Mock).mockReturnValue([
      'Table1',
    ]);
    (
      graphExcelLoader.loadWorkbookFromGraph as unknown as vi.Mock
    ).mockResolvedValue(undefined);
    (writer.addMiroIds as vi.Mock).mockImplementation((r) => r);
    (writer.downloadWorkbook as vi.Mock).mockImplementation(() => {});
    (
      GraphProcessor.prototype.getNodeIdMap as unknown as vi.Mock
    ).mockReturnValue({});
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
    vi.clearAllMocks();
  });

  test('loadRows uses named table when source starts with table:', async () => {
    (excelLoader.loadNamedTable as unknown as vi.Mock).mockReturnValue([
      { A: 1 },
    ]);
    render(<ExcelTab />);
    const file = new File(['x'], 'data.xlsx');
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    fireEvent.change(screen.getByRole('combobox', { name: /data source/i }), {
      target: { value: 'table:Table1' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /load rows/i }));
    });
    expect(excelLoader.loadNamedTable).toHaveBeenCalledWith('Table1');
  });

  test('toggle selection and create using template column', async () => {
    (excelLoader.loadSheet as unknown as vi.Mock).mockReturnValue([
      { Type: 'T' },
    ]);
    const spy = vi
      .spyOn(GraphProcessor.prototype, 'processGraph')
      .mockResolvedValue(undefined as unknown as void);
    render(<ExcelTab />);
    const file = new File(['x'], 'data.xlsx');
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      });
    });
    fireEvent.change(screen.getByRole('combobox', { name: /data source/i }), {
      target: { value: 'sheet:Sheet1' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /load rows/i }));
    });
    const cb = screen.getByLabelText(/row 1/i);
    fireEvent.click(cb);
    expect(cb).toBeChecked();
    fireEvent.change(
      screen.getByRole('combobox', { name: /template column/i }),
      { target: { value: 'Type' } },
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create nodes/i }));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('fetchRemote triggers graph loader', async () => {
    render(<ExcelTab />);
    fireEvent.change(screen.getByLabelText('graph file'), {
      target: { value: 'x' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /fetch file/i }));
    });
    expect(graphExcelLoader.loadWorkbookFromGraph).toHaveBeenCalledWith('x');
  });
});
