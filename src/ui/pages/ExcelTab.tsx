import { IconPlus, Text } from '@mirohq/design-system'
import React from 'react'

import { templateManager } from '../../board/templates'
import {
  excelLoader,
  ExcelLoader,
  ExcelRow,
  graphExcelLoader,
  GraphExcelLoader,
} from '../../core/utils/excel-loader'
import {
  Button,
  ButtonToolbar,
  Checkbox,
  EmptyState,
  InputField,
  Paragraph,
  SelectField,
  SelectOption,
  SidebarSection,
  InfoCallout,
} from '../components'
import { PageHelp } from '../components/PageHelp'
import { RowInspector } from '../components/RowInspector'
import { mapRowsToNodes, ColumnMapping } from '../../core/data-mapper'
import { TabPanel } from '../components/TabPanel'
import { useExcelData } from '../hooks/excel-data-context'
import { showError } from '../hooks/notifications'
import {
  fetchRemoteWorkbook,
  handleLocalDrop,
  useExcelCreate,
  useExcelDrop,
} from '../hooks/use-excel-handlers'
import { useExcelSync } from '../hooks/use-excel-sync'
import { StickyActions } from '../StickyActions'

import type { TabTuple } from './tab-definitions'

// prettier-ignore
type LoaderStateDispatch = React.Dispatch<React.SetStateAction<ExcelLoader | GraphExcelLoader>>;

/**
 * Remote workbook loader with error handling.
 */
async function handleRemote(
  remote: string,
  setLoader: LoaderStateDispatch,
  setFile: React.Dispatch<React.SetStateAction<File | null>>,
  setSource: React.Dispatch<React.SetStateAction<string>>,
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
): Promise<void> {
  try {
    await fetchRemoteWorkbook(remote)
    setLoader(graphExcelLoader)
    setFile(null)
    setSource('')
    setRows([])
    setSelected(new Set())
  } catch (e) {
    await showError(String(e))
  }
}

function loadRowsFromSource(
  loader: ExcelLoader | GraphExcelLoader,
  source: string,
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
): void {
  try {
    if (source.startsWith('sheet:')) {
      setRows(loader.loadSheet(source.slice(6)))
    } else if (source.startsWith('table:')) {
      setRows(loader.loadNamedTable(source.slice(6)))
    }
    setSelected(new Set())
  } catch (e) {
    void showError(String(e))
  }
}

function toggleSelection(prev: Set<number>, idx: number): Set<number> {
  const next = new Set(prev)
  if (next.has(idx)) {
    next.delete(idx)
  } /* istanbul ignore next */ else {
    next.add(idx)
  }
  return next
}

function useExcelDataSync(
  data: ReturnType<typeof useExcelData> | null,
  rows: ExcelRow[],
  idColumn: string,
  labelColumn: string,
  templateColumn: string,
): void {
  React.useEffect(() => {
    data?.setRows(rows)
    data?.setIdColumn(idColumn)
    data?.setLabelColumn(labelColumn)
    data?.setTemplateColumn(templateColumn)
  }, [rows, idColumn, labelColumn, templateColumn, data])
}

function useDropHandler(
  setLoader: LoaderStateDispatch,
  setFile: React.Dispatch<React.SetStateAction<File | null>>,
  setSource: React.Dispatch<React.SetStateAction<string>>,
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
) {
  return useExcelDrop((files) =>
    handleDrop(files, setLoader, setFile, setSource, setRows, setSelected),
  )
}

async function handleDrop(
  files: File[],
  setLoader: LoaderStateDispatch,
  setFile: React.Dispatch<React.SetStateAction<File | null>>,
  setSource: React.Dispatch<React.SetStateAction<string>>,
  setRows: React.Dispatch<React.SetStateAction<ExcelRow[]>>,
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
): Promise<void> {
  try {
    await handleLocalDrop(files)
    const f = files[0] ?? null
    setLoader(excelLoader)
    setFile(f)
    setSource('')
    setRows([])
    setSelected(new Set())
  } catch (e) {
    await showError(String(e))
  }
}

/** Sidebar tab for importing nodes from Excel files. */
export const ExcelTab: React.FC = () => {
  const state = useExcelTabState()
  const handleApplyChanges = React.useCallback(() => {
    const mapping: ColumnMapping = {
      idColumn: state.idColumn || undefined,
      labelColumn: state.labelColumn || undefined,
      templateColumn: state.templateColumn || undefined,
    }
    const chosen = state.rows.filter((_, i) => state.selected.has(i))
    if (chosen.length === 0) {
      void showError('Select at least one row to apply changes.')
      return
    }
    // TODO: Wire this directly into the template creation flow now that the diff drawer is removed.
    void showError('Bulk apply is temporarily disabled while the diff drawer is removed.')
    mapRowsToNodes(chosen, mapping)
  }, [state.idColumn, state.labelColumn, state.templateColumn, state.rows, state.selected])

  return (
    <>
      <ExcelTabView {...state} handleApplyChanges={handleApplyChanges} />
    </>
  )
}

interface ExcelTabState {
  file: File | null
  remote: string
  source: string
  rows: ExcelRow[]
  selected: Set<number>
  idColumn: string
  labelColumn: string
  templateColumn: string
  template: string
  loader: ExcelLoader | GraphExcelLoader
  dropzone: ReturnType<typeof useExcelDrop>['dropzone']
  style: React.CSSProperties
  columns: string[]
  fetchRemote: () => Promise<void>
  loadRows: () => void
  toggle: (idx: number) => void
  handleCreate: () => void
  updateRow: (index: number, updated: ExcelRow) => void
  setRemote: (v: string) => void
  setSource: (v: string) => void
  setTemplate: (v: string) => void
  setLabelColumn: (v: string) => void
  setTemplateColumn: (v: string) => void
  setIdColumn: (v: string) => void
}

function useExcelTabData() {
  const data = useExcelData()
  const [file, setFile] = React.useState<File | null>(null)
  const [remote, setRemote] = React.useState('')
  const [source, setSource] = React.useState('')
  const [rows, setRows] = React.useState<ExcelRow[]>(data?.rows ?? [])
  const [selected, setSelected] = React.useState(new Set<number>())
  const [idColumn, setIdColumn] = React.useState(data?.idColumn ?? '')
  const [labelColumn, setLabelColumn] = React.useState(data?.labelColumn ?? '')
  const [templateColumn, setTemplateColumn] = React.useState(data?.templateColumn ?? '')
  const [template, setTemplate] = React.useState('Motivation')
  const [loader, setLoader] = React.useState<ExcelLoader | GraphExcelLoader>(excelLoader)

  useExcelDataSync(data, rows, idColumn, labelColumn, templateColumn)

  return {
    data,
    file,
    setFile,
    remote,
    setRemote,
    source,
    setSource,
    rows,
    setRows,
    selected,
    setSelected,
    idColumn,
    setIdColumn,
    labelColumn,
    setLabelColumn,
    templateColumn,
    setTemplateColumn,
    template,
    setTemplate,
    loader,
    setLoader,
  }
}

function useExcelTabHandlers(state: ReturnType<typeof useExcelTabData>) {
  const {
    remote,
    setLoader,
    setFile,
    setSource,
    setRows,
    setSelected,
    loader,
    source,
    rows,
    selected,
    template,
    templateColumn,
    idColumn,
    labelColumn,
    file,
    setRows: updateRows,
  } = state

  const fetchRemote = React.useCallback(
    (): Promise<void> => handleRemote(remote, setLoader, setFile, setSource, setRows, setSelected),
    [remote, setFile, setLoader, setRows, setSelected, setSource],
  )

  const columns = React.useMemo(() => Object.keys(rows[0] ?? {}), [rows])

  const loadRows = React.useCallback(
    (): void => loadRowsFromSource(loader, source, setRows, setSelected),
    [loader, source, setRows, setSelected],
  )

  const toggle = React.useCallback(
    (idx: number): void => setSelected((prev) => toggleSelection(prev, idx)),
    [setSelected],
  )

  const syncUpdate = useExcelSync()
  const updateRow = React.useCallback(
    (index: number, updated: ExcelRow): void => void syncUpdate(index, updated),
    [syncUpdate],
  )

  const handleCreate = useExcelCreate({
    rows,
    selected,
    template,
    templateColumn,
    idColumn,
    labelColumn,
    file,
    setRows: updateRows,
  })

  const { dropzone, style } = useDropHandler(setLoader, setFile, setSource, setRows, setSelected)

  return {
    columns,
    fetchRemote,
    loadRows,
    toggle,
    updateRow,
    handleCreate,
    dropzone,
    style,
  }
}

/**
 * Manage all state and handlers for {@link ExcelTab}.
 */
function useExcelTabState(): ExcelTabState {
  const dataState = useExcelTabData()
  const handlerState = useExcelTabHandlers(dataState)
  return { ...dataState, ...handlerState } as ExcelTabState
}

/**
 * Present the Excel import UI using provided state handlers.
 */
function ExcelTabView({
  remote,
  dropzone,
  style,
  fetchRemote,
  loader,
  source,
  setSource,
  setRemote,
  loadRows,
  rows,
  template,
  setTemplate,
  labelColumn,
  setLabelColumn,
  templateColumn,
  setTemplateColumn,
  idColumn,
  setIdColumn,
  columns,
  selected,
  toggle,
  handleCreate,
  updateRow,
  handleApplyChanges,
}: ExcelTabState & {
  setSource: (s: string) => void
  setRemote: (s: string) => void
  setTemplate: (s: string) => void
  setLabelColumn: (s: string) => void
  setTemplateColumn: (s: string) => void
  setIdColumn: (s: string) => void
  handleApplyChanges: () => void
}): React.JSX.Element {
  return (
    <TabPanel tabId="excel">
      <PageHelp content="Import nodes from Excel workbooks" />
      <SidebarSection title="Source">
        <div {...dropzone.getRootProps({ style })} aria-label="Excel drop area">
          {(() => {
            const fileProps = { ...dropzone.getInputProps() }
            delete (fileProps as Record<string, unknown>).style
            delete (fileProps as Record<string, unknown>).className
            delete (fileProps as Record<string, unknown>).onChange
            return (
              <InputField
                label="Excel file"
                type="file"
                data-testid="file-input"
                {...(fileProps as Record<string, unknown>)}
              />
            )
          })()}
        </div>
        <InputField
          label="OneDrive/SharePoint file"
          value={remote}
          onValueChange={(v) => setRemote(v)}
          aria-label="graph file"
        />
        <Button onClick={fetchRemote} variant="secondary">
          Fetch File
        </Button>
        <div style={{ marginTop: 'var(--space-200)' }}>
          <InfoCallout title="Tips">
            Paste a OneDrive/SharePoint link or drop a local workbook. Then choose a sheet or table
            and click “Load Rows”.
          </InfoCallout>
        </div>
        {rows.length === 0 && loader.listSheets().length === 0 && !remote && !source && (
          <EmptyState title="No data yet" description="Fetch a file or select a sheet or table." />
        )}
      </SidebarSection>
      {loader.listSheets().length > 0 && (
        <SidebarSection title="Data source">
          <SelectField
            label="Data source"
            value={source}
            onChange={setSource}
            aria-label="Data source"
          >
            <SelectOption value="">Select…</SelectOption>
            {loader.listSheets().map((s) => (
              <SelectOption key={`s-${s}`} value={`sheet:${s}`}>
                Sheet: {s}
              </SelectOption>
            ))}
            {loader.listNamedTables().map((t) => (
              <SelectOption key={`t-${t}`} value={`table:${t}`}>
                Table: {t}
              </SelectOption>
            ))}
          </SelectField>
          <Button onClick={loadRows} variant="secondary">
            Load Rows
          </Button>
        </SidebarSection>
      )}
      {rows.length > 0 && (
        <SidebarSection title="Mapping & Selection">
          <SelectField
            label="Template"
            value={template}
            onChange={setTemplate}
            aria-label="Template"
          >
            {Object.keys(templateManager.templates).map((tpl) => (
              <SelectOption key={tpl} value={tpl}>
                {tpl}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label="Label column"
            value={labelColumn}
            onChange={setLabelColumn}
            aria-label="Label column"
          >
            <SelectOption value="">None</SelectOption>
            {columns.map((c) => (
              <SelectOption key={`l-${c}`} value={c}>
                {c}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label="Template column"
            value={templateColumn}
            onChange={setTemplateColumn}
            aria-label="Template column"
          >
            <SelectOption value="">None</SelectOption>
            {columns.map((c) => (
              <SelectOption key={`tcol-${c}`} value={c}>
                {c}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            label="ID column"
            value={idColumn}
            onChange={setIdColumn}
            aria-label="ID column"
          >
            <SelectOption value="">None</SelectOption>
            {columns.map((c) => (
              <SelectOption key={`i-${c}`} value={c}>
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
          <StickyActions>
            <ButtonToolbar>
              <Button
                onClick={handleCreate}
                variant="primary"
                iconPosition="start"
                icon={<IconPlus />}
              >
                <Text>Create Nodes</Text>
              </Button>
              <Button onClick={handleApplyChanges} variant="secondary">
                Apply changes
              </Button>
            </ButtonToolbar>
          </StickyActions>
        </SidebarSection>
      )}
      <RowInspector rows={rows} idColumn={idColumn || undefined} onUpdate={updateRow} />
    </TabPanel>
  )
}

export const tabDef: TabTuple = [6, 'excel', 'Excel', 'Import nodes from Excel workbooks', ExcelTab]
