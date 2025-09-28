import { IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
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
  Checkbox,
  DroppedFileList,
  EmptyState,
  InputField,
  SelectField,
  SelectOption,
  SidebarSection,
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
] as const satisfies ReadonlyArray<{ id: LayoutChoice; description: string }>

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
  const [lastProc, setLastProc] = React.useState<GraphProcessor | HierarchyProcessor | undefined>(
    null as unknown as GraphProcessor | HierarchyProcessor | undefined,
  )
  const optionVisibility = OPTION_VISIBILITY.get(layoutOptions.algorithm)

  // No custom keyboard toggles; advanced options are controlled via details/summary only.

  const handleFiles = React.useCallback(
    (droppedFiles: File[]): void => handleFileDrop(droppedFiles, setImportQueue, setError),
    [],
  )

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
              <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
            ))}
          </DroppedFileList>
          <div style={{ marginTop: space[200] }}>
            <fieldset>
              <VisuallyHidden asChild>
                <legend>Diagram options</legend>
              </VisuallyHidden>
              <SelectField
                label="Layout type"
                value={layoutChoice}
                onChange={(v) => setLayoutChoice(v as LayoutChoice)}
              >
                {LAYOUTS.map((l) => (
                  <SelectOption key={l} value={l}>
                    {l}
                  </SelectOption>
                ))}
              </SelectField>
              <InfoCallout title="Layout options">
                <ul style={{ margin: 0, paddingLeft: SP200 }}>
                  {LAYOUTS.map((l) => (
                    <li key={`desc-${l}`}>{LAYOUT_DESCRIPTION_MAP.get(l)}</li>
                  ))}
                </ul>
              </InfoCallout>
              <div style={{ marginTop: space[200] }}>
                <Checkbox label="Wrap items in frame" value={withFrame} onChange={setWithFrame} />
              </div>
              {withFrame && (
                <InputField
                  label="Frame title"
                  value={frameTitle}
                  onValueChange={(v) => setFrameTitle(v)}
                  placeholder="Frame title"
                />
              )}
              {/** Advanced options details */}
              <details
                open={showAdvanced}
                aria-label={ADVANCED_LABEL}
                onToggle={(event) => setShowAdvanced((event.target as HTMLDetailsElement).open)}
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
                  <InputField
                    label="Spacing"
                    type="number"
                    value={String(layoutOptions.spacing)}
                    onValueChange={(v) =>
                      setLayoutOptions({ ...layoutOptions, spacing: Number(v) })
                    }
                  />
                  {optionVisibility?.aspectRatio && (
                    <SelectField
                      label="Aspect ratio"
                      value={layoutOptions.aspectRatio}
                      onChange={(v) =>
                        setLayoutOptions({
                          ...layoutOptions,
                          aspectRatio: v as AspectRatioId,
                        })
                      }
                    >
                      {ASPECT_RATIOS.map((r) => (
                        <SelectOption key={r.id} value={r.id}>
                          {r.label}
                        </SelectOption>
                      ))}
                    </SelectField>
                  )}
                </div>
                <SelectField
                  label="Existing nodes"
                  value={existingMode}
                  onChange={(v) => setExistingMode(v as ExistingNodeMode)}
                >
                  <SelectOption value="move">Move into place</SelectOption>
                  <SelectOption value="layout">Use for layout</SelectOption>
                  <SelectOption value="ignore">Keep position</SelectOption>
                </SelectField>
                <SelectField
                  label="Algorithm"
                  value={layoutOptions.algorithm}
                  onChange={(v) =>
                    setLayoutOptions({
                      ...layoutOptions,
                      algorithm: v as ElkAlgorithm,
                    })
                  }
                >
                  {ALGORITHMS.map((a) => (
                    <SelectOption key={a} value={a}>
                      {a}
                    </SelectOption>
                  ))}
                </SelectField>
                <SelectField
                  label="Direction"
                  value={layoutOptions.direction}
                  onChange={(v) =>
                    setLayoutOptions({
                      ...layoutOptions,
                      direction: v as ElkDirection,
                    })
                  }
                >
                  {DIRECTIONS.map((d) => (
                    <SelectOption key={d} value={d}>
                      {d}
                    </SelectOption>
                  ))}
                </SelectField>
                {optionVisibility?.edgeRouting && (
                  <SelectField
                    label="Edge routing"
                    value={(layoutOptions.edgeRouting ?? 'default') as ElkEdgeRouting}
                    onChange={(v) =>
                      setLayoutOptions({
                        ...layoutOptions,
                        edgeRouting: v as ElkEdgeRouting,
                      })
                    }
                  >
                    {EDGE_ROUTINGS.map((routing) => (
                      <SelectOption key={routing} value={routing}>
                        {routing}
                      </SelectOption>
                    ))}
                  </SelectField>
                )}
                {optionVisibility?.edgeRoutingMode && (
                  <SelectField
                    label="Routing mode"
                    value={(layoutOptions.edgeRoutingMode ?? 'default') as ElkEdgeRoutingMode}
                    onChange={(v) =>
                      setLayoutOptions({
                        ...layoutOptions,
                        edgeRoutingMode: v as ElkEdgeRoutingMode,
                      })
                    }
                  >
                    {EDGE_ROUTING_MODES.map((m) => (
                      <SelectOption key={m} value={m}>
                        {m}
                      </SelectOption>
                    ))}
                  </SelectField>
                )}
                {optionVisibility?.optimizationGoal && (
                  <SelectField
                    label="Optimisation goal"
                    value={(layoutOptions.optimizationGoal ?? 'balanced') as ElkOptimizationGoal}
                    onChange={(v) =>
                      setLayoutOptions({
                        ...layoutOptions,
                        optimizationGoal: v as ElkOptimizationGoal,
                      })
                    }
                  >
                    {OPTIMIZATION_GOALS.map((o) => (
                      <SelectOption key={o} value={o}>
                        {o}
                      </SelectOption>
                    ))}
                  </SelectField>
                )}
                {layoutChoice === 'Nested' && (
                  <InputField
                    label="Padding"
                    type="number"
                    value={String(nestedPadding)}
                    onValueChange={(v) => setNestedPadding(Number(v))}
                  />
                )}
                {layoutChoice === 'Nested' && (
                  <InputField
                    label="Top spacing"
                    type="number"
                    value={String(nestedTopSpacing)}
                    onValueChange={(v) => setNestedTopSpacing(Number(v))}
                  />
                )}
              </details>
            </fieldset>
          </div>
          <div style={{ marginTop: space[200] }}>
            <StickyActions>
              <ButtonToolbar>
                <Button
                  onClick={handleCreate}
                  variant="primary"
                  iconPosition="start"
                  icon={<IconPlus />}
                >
                  <Text>Create Diagram</Text>
                </Button>
                {lastProc && (
                  <Button
                    onClick={() =>
                      undoLastImport(lastProc, () =>
                        setLastProc((_previous) => undefined as typeof _previous),
                      )
                    }
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
