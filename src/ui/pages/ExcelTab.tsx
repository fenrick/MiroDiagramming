import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Checkbox,
  InputField,
  Paragraph,
  Select,
  SelectOption,
  Text,
  Icon,
} from '../components/legacy';
import { tokens } from '../tokens';
import { excelLoader, ExcelRow } from '../../core/utils/excel-loader';
import { mapRowsToNodes, ColumnMapping } from '../../core/data-mapper';
import { templateManager } from '../../board/templates';
import { GraphProcessor } from '../../core/graph/graph-processor';
import { addMiroIds, downloadWorkbook } from '../../core/utils/workbook-writer';
import { showError } from '../hooks/notifications';
import { getDropzoneStyle } from '../hooks/ui-utils';
import { RowInspector } from '../components/RowInspector';
import type { TabTuple } from './tab-definitions';

/** Sidebar tab for importing nodes from Excel files. */
export const ExcelTab: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [source, setSource] = React.useState('');
  const [rows, setRows] = React.useState<ExcelRow[]>([]);
  const [selected, setSelected] = React.useState(new Set<number>());
  const [idColumn, setIdColumn] = React.useState('');
  const [labelColumn, setLabelColumn] = React.useState('');
  const [templateColumn, setTemplateColumn] = React.useState('');
  const [template, setTemplate] = React.useState('Role');
  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);

  const dropzone = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
    onDrop: async (files: File[]) => {
      const f = files[0];
      try {
        await excelLoader.loadWorkbook(f);
        setFile(f);
        setSource('');
        setRows([]);
        setSelected(new Set());
      } catch (e) {
        await showError(String(e));
      }
    },
  });

  const columns = React.useMemo(() => Object.keys(rows[0] ?? {}), [rows]);

  const loadRows = (): void => {
    try {
      if (source.startsWith('sheet:')) {
        setRows(excelLoader.loadSheet(source.slice(6)));
      } else if (source.startsWith('table:')) {
        setRows(excelLoader.loadNamedTable(source.slice(6)));
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
      else next.add(idx);
      return next;
    });
  };

  const handleCreate = async (): Promise<void> => {
    try {
      const mapping: ColumnMapping = {
        idColumn: idColumn || undefined,
        labelColumn: labelColumn || undefined,
        templateColumn: templateColumn || undefined,
      };
      const indices = [...selected];
      const chosen = rows.filter((_, i) => selected.has(i));
      const nodes = mapRowsToNodes(chosen, mapping).map((n) => ({
        ...n,
        type: templateColumn ? n.type : template,
      }));
      await graphProcessor.processGraph({ nodes, edges: [] });
      const idMap = graphProcessor.getNodeIdMap();
      const updated = addMiroIds(chosen, mapping.idColumn ?? '', idMap);
      const merged = rows.map((r, i) => {
        const idx = indices.indexOf(i);
        return idx >= 0 ? updated[idx] : r;
      });
      setRows(merged);
      if (file) {
        downloadWorkbook(merged, `updated-${file.name}`);
      }
    } catch (e) {
      await showError(String(e));
    }
  };

  const style = React.useMemo(
    () => getDropzoneStyle(dropzone.isDragAccept, dropzone.isDragReject),
    [dropzone.isDragAccept, dropzone.isDragReject],
  );

  return (
    <div style={{ marginTop: tokens.space.small }}>
      <div
        {...dropzone.getRootProps({ style })}
        aria-label='Excel drop area'>
        <InputField label='Excel file'>
          <input
            data-testid='file-input'
            {...dropzone.getInputProps()}
          />
        </InputField>
      </div>
      {file && (
        <>
          <InputField label='Data source'>
            <Select
              value={source}
              onChange={setSource}
              aria-label='Data source'>
              <SelectOption value=''>Select…</SelectOption>
              {excelLoader.listSheets().map((s) => (
                <SelectOption
                  key={`s-${s}`}
                  value={`sheet:${s}`}>
                  Sheet: {s}
                </SelectOption>
              ))}
              {excelLoader.listNamedTables().map((t) => (
                <SelectOption
                  key={`t-${t}`}
                  value={`table:${t}`}>
                  Table: {t}
                </SelectOption>
              ))}
            </Select>
          </InputField>
          <Button
            onClick={loadRows}
            variant='secondary'>
            Load Rows
          </Button>
        </>
      )}
      {rows.length > 0 && (
        <>
          <InputField label='Template'>
            <Select
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
            </Select>
          </InputField>
          <InputField label='Label column'>
            <Select
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
            </Select>
          </InputField>
          <InputField label='Template column'>
            <Select
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
            </Select>
          </InputField>
          <InputField label='ID column'>
            <Select
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
            </Select>
          </InputField>
          <ul style={{ maxHeight: 160, overflowY: 'auto' }}>
            {rows.map((r, i) => (
              <li key={i}>
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
              variant='primary'>
              <React.Fragment key='.0'>
                <Icon name='plus' />
                <Text>Create Nodes</Text>
              </React.Fragment>
            </Button>
          </div>
        </>
      )}
      <RowInspector
        rows={rows}
        idColumn={idColumn || undefined}
      />
    </div>
  );
};

export const tabDef: TabTuple = [
  6,
  'excel',
  'Excel',
  'Import nodes from Excel workbooks',
  ExcelTab,
];
