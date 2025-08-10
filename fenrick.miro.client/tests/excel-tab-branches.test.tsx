/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
/* eslint-disable no-var */
import React from 'react';
import { ExcelTab } from '../src/ui/pages/ExcelTab';

var localDropMock: vi.Mock;
var remoteFetchMock: vi.Mock;
var showErrorMock: vi.Mock;
var excelLoaderMock: Record<string, unknown>;
var graphLoaderMock: Record<string, unknown>;

vi.mock('../src/ui/hooks/use-excel-sync', () => ({
  useExcelSync: () => vi.fn(),
}));
vi.mock('../src/ui/hooks/excel-data-context', () => ({
  useExcelData: () => null,
}));
vi.mock('../src/ui/components/Select', () => ({
  Select: ({
    value,
    onChange,
    children,
  }: {
    value?: string;
    onChange?: (v: string) => void;
    children?: React.ReactNode;
  }) => (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectOption: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));
vi.mock('../src/ui/hooks/use-excel-handlers', () => {
  localDropMock = vi.fn();
  remoteFetchMock = vi.fn();
  return {
    useExcelDrop: () => ({
      dropzone: { getRootProps: () => ({}), getInputProps: () => ({}) },
      style: {},
    }),
    useExcelCreate: () => vi.fn(),
    handleLocalDrop: (files: File[]) => localDropMock(files),
    fetchRemoteWorkbook: (url: string) => remoteFetchMock(url),
  };
});
vi.mock('../src/core/utils/excel-loader', () => {
  excelLoaderMock = {
    listSheets: vi.fn(() => ['Sheet1']),
    listNamedTables: vi.fn(() => ['Table1']),
    loadSheet: vi.fn(() => [{ A: 1 }]),
    loadNamedTable: vi.fn(() => [{ T: 1 }]),
  };
  graphLoaderMock = {
    listSheets: vi.fn(() => ['Remote']),
    listNamedTables: vi.fn(() => []),
    loadSheet: vi.fn(() => [{ B: 2 }]),
    loadNamedTable: vi.fn(() => []),
  };
  return {
    excelLoader: excelLoaderMock,
    graphExcelLoader: graphLoaderMock,
    ExcelLoader: class {},
    GraphExcelLoader: class {},
  };
});
vi.mock('../src/ui/hooks/notifications', () => {
  showErrorMock = vi.fn();
  return { showError: showErrorMock };
});

describe('ExcelTab branches', () => {
  test('fetch error displays notification', async () => {
    remoteFetchMock.mockRejectedValueOnce(new Error('fail'));
    render(<ExcelTab />);
    fireEvent.change(screen.getByLabelText('graph file'), {
      target: { value: 'bad' },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Fetch File' })),
    );
    expect(showErrorMock).toHaveBeenCalledWith('Error: fail');
  });

  test('loads rows from sheet and toggles selection', () => {
    render(<ExcelTab />);
    const select = screen
      .getByText('Data source')
      .parentElement!.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'sheet:Sheet1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Rows' }));
    expect(screen.getByText('{"A":1}')).toBeInTheDocument();
    const checkbox = screen.getByRole('switch', { name: 'Row 1' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('loads rows from named table', () => {
    render(<ExcelTab />);
    const select = screen
      .getByText('Data source')
      .parentElement!.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'table:Table1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Rows' }));
    expect(screen.getByText('{"T":1}')).toBeInTheDocument();
  });

  test('successful remote fetch switches loader', async () => {
    render(<ExcelTab />);
    remoteFetchMock.mockResolvedValueOnce(undefined);
    fireEvent.change(screen.getByLabelText('graph file'), {
      target: { value: 'url' },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Fetch File' })),
    );
    const select = screen
      .getByText('Data source')
      .parentElement!.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'sheet:Remote' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load Rows' }));
    expect(screen.getByText('{"B":2}')).toBeInTheDocument();
  });
});
