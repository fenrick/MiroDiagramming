/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
/* eslint-disable no-var */
import React from 'react';
import { ExcelTab } from '../src/ui/pages/ExcelTab';

let dropHandler: (files: File[]) => Promise<void>;
var localDropMock: vi.Mock;
var remoteFetchMock: vi.Mock;
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
      onChange={(e) => onChange?.(e.target.value)}>
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
    useExcelDrop: (onDrop: (files: File[]) => Promise<void>) => {
      dropHandler = onDrop;
      return {
        dropzone: { getRootProps: () => ({}), getInputProps: () => ({}) },
        style: {},
      };
    },
    useExcelCreate: () => vi.fn(),
    handleLocalDrop: (files: File[]) => localDropMock(files),
    fetchRemoteWorkbook: (url: string) => remoteFetchMock(url),
  };
});
vi.mock('../src/core/utils/excel-loader', () => {
  excelLoaderMock = {
    listSheets: vi.fn(() => ['Sheet1']),
    listNamedTables: vi.fn(() => []),
    loadSheet: vi.fn(() => [{ A: 1 }]),
    loadNamedTable: vi.fn(() => []),
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

describe('ExcelTab', () => {
  test('handles local file drop', async () => {
    render(<ExcelTab />);
    const file = new File(['a'], 'a.xlsx');
    await act(async () => await dropHandler([file]));
    expect(localDropMock).toHaveBeenCalledWith([file]);
  });

  test('fetches workbook from remote source', async () => {
    render(<ExcelTab />);
    fireEvent.change(screen.getByLabelText('graph file'), {
      target: { value: 'url' },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Fetch File' })),
    );
    expect(remoteFetchMock).toHaveBeenCalledWith('url');
  });
});
