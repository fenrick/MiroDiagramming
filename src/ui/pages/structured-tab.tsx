import { IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import { LegacyCheckbox as BaseLegacyCheckbox } from '@base-ui-components/react/checkbox'
import { Input as BaseInput } from '@base-ui-components/react/input'
import { Select } from '@base-ui-components/react/select'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { type ExistingNodeMode, type GraphProcessor } from '../../core/graph/graph-processor'
import { type HierarchyProcessor } from '../../core/graph/hierarchy-processor'
import {
  ALGORITHMS,
  DEFAULT_LAYOUT_OPTIONS,
  DIRECTIONS,
  EDGE_ROUTING_MODES,
  EDGE_ROUTINGS,
  type ElkAlgorithm,
  type ElkDirection,
  type ElkEdgeRouting,
  type ElkEdgeRoutingMode,
  type ElkOptimizationGoal,
  OPTIMIZATION_GOALS,
  type UserLayoutOptions,
} from '../../core/layout/elk-options'
import { ASPECT_RATIOS, type AspectRatioId } from '../../core/utils/aspect-ratio'
import {
  Button,
  ButtonToolbar,
  DroppedFileList,
  EmptyState,
  Skeleton,
  InfoCallout,
} from '../components'
import { StickyActions } from '../sticky-actions'
import { JsonDropZone } from '../components/json-drop-zone'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { undoLastImport } from '../hooks/ui-utilities'
import { type LayoutChoice, useDiagramCreate } from '../hooks/use-diagram-create'

/**
 * Queue the first file from a drop event for import.
 *
 * @param droppedFiles - Files received from the drop zone.
 * @param setImportQueue - Setter storing files for processing.
 * @param setError - Setter clearing any previous error state.
 */
export function handleFileDrop(
  droppedFiles: File[],
  setImportQueue: React.Dispatch<React.SetStateAction<File[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
): void {
  if (droppedFiles.length === 0) {
    return
  }
  const file = droppedFiles[0]
  if (!file) {
    return
  }
  setImportQueue([file])
  setError(null)
}

const LAYOUT_CONFIGS = [
  { id: 'Layered', description: 'Flow diagrams with layers' },
  { id: 'Tree', description: 'Compact hierarchical tree' },
  { id: 'Grid', description: 'Organic force-directed grid' },
  { id: 'Nested', description: 'Containers sized to fit children' },
  { id: 'Radial', description: 'Circular layout around a hub' },
  { id: 'Box', description: 'Uniform box grid' },
  { id: 'Rect Packing', description: 'Fits rectangles within parents' },
] as const satisfies readonly { id: LayoutChoice; description: string }[]

const LAYOUTS = LAYOUT_CONFIGS.map((config) => config.id) as readonly LayoutChoice[]

const LAYOUT_DESCRIPTION_MAP = new Map<LayoutChoice, string>(
  LAYOUT_CONFIGS.map((config) => [config.id, config.description]),
)

const OPTION_VISIBILITY = new Map<
  ElkAlgorithm,
  {
    aspectRatio: boolean
    edgeRouting?: boolean
    edgeRoutingMode?: boolean
    optimizationGoal?: boolean
  }
>([
  ['layered', { aspectRatio: true, edgeRouting: true }],
  ['mrtree', { aspectRatio: true, edgeRoutingMode: true }],
  ['force', { aspectRatio: true }],
  ['rectpacking', { aspectRatio: true, optimizationGoal: true }],
  ['rectstacking', { aspectRatio: true }],
  ['box', { aspectRatio: true }],
  ['radial', { aspectRatio: true }],
])

/** UI for the Structured sub-tab. */

const ADVANCED_LABEL = 'Advanced options'
const SP200 = 'var(--space-200)'

export const StructuredTab: React.FC = () => {
  const [importQueue, setImportQueue] = React.useState<File[]>([])
  const [layoutChoice, setLayoutChoice] = React.useState<LayoutChoice>('Layered')
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [withFrame, setWithFrame] = React.useState(false)
  const [frameTitle, setFrameTitle] = React.useState('')
  const [layoutOptions, setLayoutOptions] =
    React.useState<UserLayoutOptions>(DEFAULT_LAYOUT_OPTIONS)
  const [nestedPadding, setNestedPadding] = React.useState(20)
  const [nestedTopSpacing, setNestedTopSpacing] = React.useState(50)
  const [existingMode, setExistingMode] = React.useState<ExistingNodeMode>('move')
  const [progress, setProgress] = React.useState<number>(0)
  const [error, setError] = React.useState<string | null>(null)
  const [lastProc, setLastProc] = React.useState<GraphProcessor | HierarchyProcessor | undefined>()
  const optionVisibility = OPTION_VISIBILITY.get(layoutOptions.algorithm)

  // No custom keyboard toggles; advanced options are controlled via details/summary only.

  const handleFiles = React.useCallback((droppedFiles: File[]): void => {
    handleFileDrop(droppedFiles, setImportQueue, setError)
  }, [])

  const handleCreate = useDiagramCreate(
    importQueue,
    {
      layoutChoice,
      showAdvanced,
      withFrame,
      frameTitle,
      layoutOpts: layoutOptions,
      nestedPadding,
      nestedTopSpacing,
      existingMode,
    },
    setImportQueue,
    setProgress,
    setError,
    setLastProc,
  )

  return (
    <TabPanel tabId="structured">
      <PageHelp content="Flow or tree diagrams with advanced options" />
      <JsonDropZone onFiles={handleFiles} />
      {importQueue.length === 0 && (
        <EmptyState
          title="Drop a JSON file"
          description="Drag a JSON/CSV file to create a diagram."
        />
      )}
      {importQueue.length > 0 && (
        <SidebarSection title="Diagram import">
          <DroppedFileList>
            {importQueue.map((file) => (
              <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
            ))}
          </DroppedFileList>
          <div style={{ marginTop: space[200] }}>
            <fieldset>
              <VisuallyHidden asChild>
                <legend>Diagram options</legend>
              </VisuallyHidden>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-50)' }}>
                <label id="layout-type-label" style={{ fontWeight: 600 }}>
                  Layout type
                </label>
                <Select.Root
                  value={layoutChoice}
                  onValueChange={(value) => setLayoutChoice(value as LayoutChoice)}
                >
                  <Select.Trigger aria-labelledby="layout-type-label" style={{ width: '100%' }}>
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner>
                      <Select.Popup>
                        <Select.List>
                          {LAYOUTS.map((l) => (
                            <Select.Item key={l} value={l}>
                              <Select.ItemText>{l}</Select.ItemText>
                              <Select.ItemIndicator>✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </div>
              <InfoCallout title="Layout options">
                <ul style={{ margin: 0, paddingLeft: SP200 }}>
                  {LAYOUTS.map((l) => (
                    <li key={`desc-${l}`}>{LAYOUT_DESCRIPTION_MAP.get(l)}</li>
                  ))}
                </ul>
              </InfoCallout>
              <div
                style={{
                  marginTop: space[200],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-100)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-75)' }}>
                  <BaseLegacyCheckbox.Root
                    checked={withFrame}
                    onCheckedChange={(checked) => setWithFrame(Boolean(checked))}
                    id="with-frame"
                  >
                    <BaseLegacyCheckbox.Indicator>✓</BaseLegacyCheckbox.Indicator>
                  </BaseLegacyCheckbox.Root>
                  Wrap items in frame
                </label>
                {withFrame && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-50)' }}>
                    <label htmlFor="frame-title" style={{ fontWeight: 600 }}>
                      Frame title
                    </label>
                    <BaseInput
                      id="frame-title"
                      value={frameTitle}
                      onValueChange={(v) => {
                        setFrameTitle(String(v))
                      }}
                      placeholder="Frame title"
                    />
                  </div>
                )}
              </div>
              {/** Advanced options details */}
              <details
                open={showAdvanced}
                aria-label={ADVANCED_LABEL}
                onToggle={(event) => {
                  setShowAdvanced((event.target as HTMLDetailsElement).open)
                }}
              >
                <summary aria-expanded={showAdvanced}>{ADVANCED_LABEL}</summary>
                <div style={{ marginBottom: SP200 }}>
                  <InfoCallout title="Existing nodes">
                    Choose how existing items on the board are treated during layout. “Move into
                    place” repositions items, “Use for layout” anchors them, and “Keep position”
                    leaves them untouched.
                  </InfoCallout>
                </div>
                <div style={{ display: 'grid', rowGap: SP200 }}>
                  <LegacyInputField
                    label="Spacing"
                    type="number"
                    value={String(layoutOptions.spacing)}
                    onValueChange={(v) => {
                      setLayoutOptions({ ...layoutOptions, spacing: Number(v) })
                    }}
                  />
                  {optionVisibility?.aspectRatio && (
                    <SelectTrigger
                      label="Aspect ratio"
                      value={layoutOptions.aspectRatio}
                      onChange={(v) => {
                        setLayoutOptions({
                          ...layoutOptions,
                          aspectRatio: v as AspectRatioId,
                        })
                      }}
                    >
                      {ASPECT_RATIOS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectTrigger>
                  )}
                </div>
                <SelectTrigger
                  label="Existing nodes"
                  value={existingMode}
                  onChange={(v) => {
                    setExistingMode(v as ExistingNodeMode)
                  }}
                >
                  <SelectItem value="move">Move into place</SelectItem>
                  <SelectItem value="layout">Use for layout</SelectItem>
                  <SelectItem value="ignore">Keep position</SelectItem>
                </SelectTrigger>
                <SelectTrigger
                  label="Algorithm"
                  value={layoutOptions.algorithm}
                  onChange={(v) => {
                    setLayoutOptions({
                      ...layoutOptions,
                      algorithm: v as ElkAlgorithm,
                    })
                  }}
                >
                  {ALGORITHMS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectTrigger>
                <SelectTrigger
                  label="Direction"
                  value={layoutOptions.direction}
                  onChange={(v) => {
                    setLayoutOptions({
                      ...layoutOptions,
                      direction: v as ElkDirection,
                    })
                  }}
                >
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectTrigger>
                {optionVisibility?.edgeRouting && (
                  <SelectTrigger
                    label="Edge routing"
                    value={(layoutOptions.edgeRouting ?? 'default') as ElkEdgeRouting}
                    onChange={(v) => {
                      setLayoutOptions({
                        ...layoutOptions,
                        edgeRouting: v as ElkEdgeRouting,
                      })
                    }}
                  >
                    {EDGE_ROUTINGS.map((routing) => (
                      <SelectItem key={routing} value={routing}>
                        {routing}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                )}
                {optionVisibility?.edgeRoutingMode && (
                  <SelectTrigger
                    label="Routing mode"
                    value={(layoutOptions.edgeRoutingMode ?? 'default') as ElkEdgeRoutingMode}
                    onChange={(v) => {
                      setLayoutOptions({
                        ...layoutOptions,
                        edgeRoutingMode: v as ElkEdgeRoutingMode,
                      })
                    }}
                  >
                    {EDGE_ROUTING_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                )}
                {optionVisibility?.optimizationGoal && (
                  <SelectTrigger
                    label="Optimisation goal"
                    value={(layoutOptions.optimizationGoal ?? 'balanced') as ElkOptimizationGoal}
                    onChange={(v) => {
                      setLayoutOptions({
                        ...layoutOptions,
                        optimizationGoal: v as ElkOptimizationGoal,
                      })
                    }}
                  >
                    {OPTIMIZATION_GOALS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                )}
                {layoutChoice === 'Nested' && (
                  <LegacyInputField
                    label="Padding"
                    type="number"
                    value={String(nestedPadding)}
                    onValueChange={(v) => {
                      setNestedPadding(Number(v))
                    }}
                  />
                )}
                {layoutChoice === 'Nested' && (
                  <LegacyInputField
                    label="Top spacing"
                    type="number"
                    value={String(nestedTopSpacing)}
                    onValueChange={(v) => {
                      setNestedTopSpacing(Number(v))
                    }}
                  />
                )}
              </details>
            </fieldset>
          </div>
          <div style={{ marginTop: space[200] }}>
            <StickyActions>
              <ButtonToolbar>
                <Button
                  onClick={() => {
                    void handleCreate()
                  }}
                  variant="primary"
                  iconPosition="start"
                  icon={<IconPlus />}
                >
                  <Text>Create Diagram</Text>
                </Button>
                {lastProc && (
                  <Button
                    onClick={() => {
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }}
                    variant="secondary"
                    iconPosition="start"
                    icon={<IconArrowArcLeft />}
                  >
                    <Text>Undo Last Import</Text>
                  </Button>
                )}
              </ButtonToolbar>
            </StickyActions>
            {progress > 0 && progress < 100 && (
              <output
                aria-label="Loading"
                style={{ display: 'block', marginTop: 'var(--space-100)' }}
              >
                <Skeleton />
                <Skeleton />
              </output>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </SidebarSection>
      )}
      {/* BoardLoader debug section removed in frontend-only cleanup */}
    </TabPanel>
  )
}
