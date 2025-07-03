import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  SelectField,
  Paragraph,
  SelectOption,
} from '../components';
import {
  excelLoader,
  graphExcelLoader,
  ExcelRow,
  ExcelLoader,
  GraphExcelLoader,
} from '../../core/utils/excel-loader';
import { templateManager } from '../../board/templates';
import { TabPanel } from '../components/TabPanel';
import { showError } from '../hooks/notifications';
import { RowInspector } from '../components/RowInspector';
import type { TabTuple } from './tab-definitions';
import { useExcelData } from '../hooks/excel-data-context';
import { useExcelSync } from '../hooks/use-excel-sync';
import {
  useExcelDrop,
  useExcelCreate,
  handleLocalDrop,
  fetchRemoteWorkbook,
} from '../hooks/use-excel-handlers';
import { IconPlus, Text } from '@mirohq/design-system';

/** Sidebar tab for importing nodes from Excel files. */
// eslint-disable-next-line complexity
export const ExcelTab: React.FC = () => {
  const data = useExcelData();
  const [file, setFile] = React.useState<File | null>(null);
  const [remote, setRemote] = React.useState('');
  const [source, setSource] = React.useState('');
  const [rows, setRows] = React.useState<ExcelRow[]>(data?.rows ?? []);
  const [selected, setSelected] = React.useState(new Set<number>());
  const [idColumn, setIdColumn] = React.useState(data?.idColumn ?? '');
  const [labelColumn, setLabelColumn] = React.useState(data?.labelColumn ?? '');
  const [templateColumn, setTemplateColumn] = React.useState(
    data?.templateColumn ?? '',
  );
  const [template, setTemplate] = React.useState('Motivation');
  const [loader, setLoader] = React.useState<ExcelLoader | GraphExcelLoader>(
    excelLoader,
  );

  React.useEffect(() => {
    data?.setRows(rows);
  }, [rows, data]);
  React.useEffect(() => {
    data?.setIdColumn(idColumn);
  }, [idColumn, data]);
  React.useEffect(() => {
    data?.setLabelColumn(labelColumn);
  }, [labelColumn, data]);
  React.useEffect(() => {
    data?.setTemplateColumn(templateColumn);
  }, [templateColumn, data]);

  const fetchRemote = async (): Promise<void> => {
    try {
      await fetchRemoteWorkbook(remote);
      setLoader(graphExcelLoader);
      setFile(null);
      setSource('');
      setRows([]);
      setSelected(new Set());
    } catch (e) {
      await showError(String(e));
    }
  };

  const columns = React.useMemo(() => Object.keys(rows[0] ?? {}), [rows]);

  const loadRows = (): void => {
    try {
      if (source.startsWith('sheet:')) {
        setRows(loader.loadSheet(source.slice(6)));
      } else if (source.startsWith('table:')) {
        setRows(loader.loadNamedTable(source.slice(6)));
      }
      setSelected(new Set());
    } catch (e) {
      void showError(String(e));
    }
  };

  const toggle = (idx: number): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      /* istanbul ignore next */ else next.add(idx);
      return next;
    });
  };

  const syncUpdate = useExcelSync();
  const updateRow = React.useCallback(
    (index: number, updated: ExcelRow): void => {
      void syncUpdate(index, updated);
    },
    [syncUpdate],
  );

  const handleCreate = useExcelCreate({
    rows,
    selected,
    template,
    templateColumn,
    idColumn,
    labelColumn,
    file,
    setRows,
  });

  const { dropzone, style } = useExcelDrop(async (files) => {
    try {
      await handleLocalDrop(files);
      const f = files[0];
      setLoader(excelLoader);
      setFile(f);
      setSource('');
      setRows([]);
      setSelected(new Set());
    } catch (e) {
      await showError(String(e));
    }
  });

  return (
    <TabPanel tabId='excel'>
      <div
        {...dropzone.getRootProps({ style })}
        aria-label='Excel drop area'>
        {(() => {
          const {
            style: _style,
            className: _class,
            onChange: _on,
            ...fileProps
          } = dropzone.getInputProps();
          void _style;
          void _class;
          void _on;
          return (
            <InputField
              label='Excel file'
              type='file'
              data-testid='file-input'
              {...(fileProps as Record<string, unknown>)}
            />
          );
        })()}
      </div>
      <InputField
        label='OneDrive/SharePoint file'
        value={remote}
        onChange={(v) => setRemote(v)}
        aria-label='graph file'
      />
      <Button
        onClick={fetchRemote}
        variant='secondary'>
        Fetch File
      </Button>
      {loader.listSheets().length > 0 && (
        <>
          <SelectField
            label='Data source'
            value={source}
            onChange={setSource}
            aria-label='Data source'>
            <SelectOption value=''>Select…</SelectOption>
            {loader.listSheets().map((s) => (
              <SelectOption
                key={`s-${s}`}
                value={`sheet:${s}`}>
                Sheet: {s}
              </SelectOption>
            ))}
            {loader.listNamedTables().map((t) => (
              <SelectOption
                key={`t-${t}`}
                value={`table:${t}`}>
                Table: {t}
              </SelectOption>
            ))}
          </SelectField>
          <Button
            onClick={loadRows}
            variant='secondary'>
            Load Rows
          </Button>
        </>
      )}
      {rows.length > 0 && (
        <>
          <SelectField
            label='Template'
            value={template}
            onChange={setTemplate}
            aria-label='Template'>
            {Object.keys(templateManager.templates).map((tpl) => (
              <SelectOption
                key={tpl}
                value={tpl}>
                {tpl}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label='Label column'
            value={labelColumn}
            onChange={setLabelColumn}
            aria-label='Label column'>
            <SelectOption value=''>None</SelectOption>
            {columns.map((c) => (
              <SelectOption
                key={`l-${c}`}
                value={c}>
                {c}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label='Template column'
            value={templateColumn}
            onChange={setTemplateColumn}
            aria-label='Template column'>
            <SelectOption value=''>None</SelectOption>
            {columns.map((c) => (
              <SelectOption
                key={`tcol-${c}`}
                value={c}>
                {c}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label='ID column'
            value={idColumn}
            onChange={setIdColumn}
            aria-label='ID column'>
            <SelectOption value=''>None</SelectOption>
            {columns.map((c) => (
              <SelectOption
                key={`i-${c}`}
                value={c}>
                {c}
              </SelectOption>
            ))}
          </SelectField>
          <ul style={{ maxHeight: 160, overflowY: 'auto' }}>
            {rows.map((r, i) => (
              <li key={idColumn ? String(r[idColumn]) : JSON.stringify(r)}>
                <Checkbox
                  label={`Row ${i + 1}`}
                  value={selected.has(i)}
                  onChange={() => toggle(i)}
                />
                <Paragraph>{JSON.stringify(r)}</Paragraph>
              </li>
            ))}
          </ul>
          <div className='buttons'>
            <Button
              onClick={handleCreate}
              variant='primary'
              iconPosition='start'
              icon={<IconPlus />}>
              <Text>Create Nodes</Text>
            </Button>
          </div>
        </>
      )}
      <RowInspector
        rows={rows}
        idColumn={idColumn || undefined}
        onUpdate={updateRow}
      />
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  6,
  'excel',
  'Excel',
  'Import nodes from Excel workbooks',
  ExcelTab,
];
