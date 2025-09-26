import { IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { ExistingNodeMode, GraphProcessor } from '../../core/graph/graph-processor'
import { HierarchyProcessor } from '../../core/graph/hierarchy-processor'
import {
  ALGORITHMS,
  DEFAULT_LAYOUT_OPTIONS,
  DIRECTIONS,
  EDGE_ROUTING_MODES,
  EDGE_ROUTINGS,
  ElkAlgorithm,
  ElkDirection,
  ElkEdgeRouting,
  ElkEdgeRoutingMode,
  ElkOptimizationGoal,
  OPTIMIZATION_GOALS,
  UserLayoutOptions,
} from '../../core/layout/elk-options'
import { ASPECT_RATIOS, AspectRatioId } from '../../core/utils/aspect-ratio'
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
import { StickyActions } from '../StickyActions'
import { JsonDropZone } from '../components/JsonDropZone'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'
import { undoLastImport } from '../hooks/ui-utils'
import { LayoutChoice, useAdvancedToggle, useDiagramCreate } from '../hooks/use-diagram-create'

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
  if (!droppedFiles.length) {
    return
  }
  const file = droppedFiles[0]
  if (!file) {
    return
  }
  setImportQueue([file])
  setError(null)
}

const LAYOUTS = ['Layered', 'Tree', 'Grid', 'Nested', 'Radial', 'Box', 'Rect Packing'] as const

const OPTION_VISIBILITY: Record<
  ElkAlgorithm,
  {
    aspectRatio: boolean
    edgeRouting?: boolean
    edgeRoutingMode?: boolean
    optimizationGoal?: boolean
  }
> = {
  layered: { aspectRatio: true, edgeRouting: true },
  mrtree: { aspectRatio: true, edgeRoutingMode: true },
  force: { aspectRatio: true },
  rectpacking: { aspectRatio: true, optimizationGoal: true },
  rectstacking: { aspectRatio: true },
  box: { aspectRatio: true },
  radial: { aspectRatio: true },
}

/** Descriptions for layout choices shown inline when importing graphs. */
const LAYOUT_DESCRIPTIONS: Record<LayoutChoice, string> = {
  Layered: 'Flow diagrams with layers',
  Tree: 'Compact hierarchical tree',
  Grid: 'Organic force-directed grid',
  Nested: 'Containers sized to fit children',
  Radial: 'Circular layout around a hub',
  Box: 'Uniform box grid',
  'Rect Packing': 'Fits rectangles within parents',
}

/** UI for the Structured sub-tab. */

export const StructuredTab: React.FC = () => {
  const [importQueue, setImportQueue] = React.useState<File[]>([])
  const [layoutChoice, setLayoutChoice] = React.useState<LayoutChoice>('Layered')
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [withFrame, setWithFrame] = React.useState(false)
  const [frameTitle, setFrameTitle] = React.useState('')
  const [layoutOpts, setLayoutOpts] = React.useState<UserLayoutOptions>(DEFAULT_LAYOUT_OPTIONS)
  const [nestedPadding, setNestedPadding] = React.useState(20)
  const [nestedTopSpacing, setNestedTopSpacing] = React.useState(50)
  const [existingMode, setExistingMode] = React.useState<ExistingNodeMode>('move')
  const [progress, setProgress] = React.useState<number>(0)
  const [error, setError] = React.useState<string | null>(null)
  const [lastProc, setLastProc] = React.useState<GraphProcessor | HierarchyProcessor | undefined>(
    undefined,
  )

  useAdvancedToggle(setShowAdvanced)

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
      layoutOpts,
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
                <ul style={{ margin: 0, paddingLeft: 'var(--space-200)' }}>
                  {LAYOUTS.map((l) => (
                    <li key={`desc-${l}`}>{LAYOUT_DESCRIPTIONS[l]}</li>
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
              <details
                open={showAdvanced}
                aria-label="Advanced options"
                onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
              >
                <summary aria-expanded={showAdvanced}>Advanced options</summary>
                <div style={{ marginBottom: 'var(--space-200)' }}>
                  <InfoCallout title="Existing nodes">
                    Choose how existing items on the board are treated during layout. “Move into
                    place” repositions items, “Use for layout” anchors them, and “Keep position”
                    leaves them untouched.
                  </InfoCallout>
                </div>
                <div style={{ display: 'grid', rowGap: 'var(--space-200)' }}>
                  <InputField
                    label="Spacing"
                    type="number"
                    value={String(layoutOpts.spacing)}
                    onValueChange={(v) => setLayoutOpts({ ...layoutOpts, spacing: Number(v) })}
                  />
                  {OPTION_VISIBILITY[layoutOpts.algorithm].aspectRatio && (
                    <SelectField
                      label="Aspect ratio"
                      value={layoutOpts.aspectRatio}
                      onChange={(v) =>
                        setLayoutOpts({
                          ...layoutOpts,
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
                  value={layoutOpts.algorithm}
                  onChange={(v) =>
                    setLayoutOpts({
                      ...layoutOpts,
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
                  value={layoutOpts.direction}
                  onChange={(v) =>
                    setLayoutOpts({
                      ...layoutOpts,
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
                {OPTION_VISIBILITY[layoutOpts.algorithm].edgeRouting && (
                  <SelectField
                    label="Edge routing"
                    value={layoutOpts.edgeRouting as ElkEdgeRouting}
                    onChange={(v) =>
                      setLayoutOpts({
                        ...layoutOpts,
                        edgeRouting: v as ElkEdgeRouting,
                      })
                    }
                  >
                    {EDGE_ROUTINGS.map((e) => (
                      <SelectOption key={e} value={e}>
                        {e}
                      </SelectOption>
                    ))}
                  </SelectField>
                )}
                {OPTION_VISIBILITY[layoutOpts.algorithm].edgeRoutingMode && (
                  <SelectField
                    label="Routing mode"
                    value={layoutOpts.edgeRoutingMode as ElkEdgeRoutingMode}
                    onChange={(v) =>
                      setLayoutOpts({
                        ...layoutOpts,
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
                {OPTION_VISIBILITY[layoutOpts.algorithm].optimizationGoal && (
                  <SelectField
                    label="Optimisation goal"
                    value={layoutOpts.optimizationGoal as ElkOptimizationGoal}
                    onChange={(v) =>
                      setLayoutOpts({
                        ...layoutOpts,
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
                    onClick={() => undoLastImport(lastProc, () => setLastProc(undefined))}
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
