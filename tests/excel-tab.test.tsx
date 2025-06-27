/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelTab } from '../src/ui/pages/ExcelTab';
import { excelLoader } from '../src/core/utils/excel-loader';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import * as writer from '../src/core/utils/workbook-writer';

vi.mock('../src/core/utils/excel-loader');
vi.mock('../src/core/graph/graph-processor');
vi.mock('../src/core/utils/workbook-writer');

describe('ExcelTab', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: {
        ui: { on: vi.fn() },
        getSelection: vi.fn().mockResolvedValue([]),
      },
    };
    (excelLoader.loadWorkbook as unknown as jest.Mock).mockResolvedValue(
      undefined,
    );
    (excelLoader.listSheets as unknown as jest.Mock).mockReturnValue([
      'Sheet1',
    ]);
    (excelLoader.listNamedTables as unknown as jest.Mock).mockReturnValue([
      'Table1',
    ]);
    (excelLoader.loadSheet as unknown as jest.Mock).mockReturnValue([{ A: 1 }]);
    (writer.addMiroIds as jest.Mock).mockImplementation((r) => r);
    (writer.downloadWorkbook as jest.Mock).mockImplementation(() => {});
    (
      GraphProcessor.prototype.getNodeIdMap as unknown as jest.Mock
    ).mockReturnValue({ n1: 'w1' });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
    vi.clearAllMocks();
  });

  test('shows sheet options after drop', async () => {
    render(<ExcelTab />);
    const input = screen.getByTestId('file-input');
    const file = new File(['x'], 'data.xlsx');
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(
      screen.getByRole('combobox', { name: /data source/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /sheet: sheet1/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /table: table1/i }),
    ).toBeInTheDocument();
  });

  test('creates nodes from selected rows', async () => {
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
    fireEvent.click(screen.getByLabelText(/row 1/i));
    fireEvent.change(screen.getByRole('combobox', { name: /label column/i }), {
      target: { value: 'A' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create nodes/i }));
    });
    expect(spy).toHaveBeenCalled();
  });
});
