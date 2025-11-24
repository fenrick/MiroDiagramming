import { IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Input } from '@base-ui-components/react/input'
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
  type ElkEdgeRouting,
  type ElkEdgeRoutingMode,
  type ElkOptimizationGoal,
  OPTIMIZATION_GOALS,
  type UserLayoutOptions,
} from '../../core/layout/elk-options'
import { ASPECT_RATIOS } from '../../core/utils/aspect-ratio'
import { DroppedFileList, EmptyState, InfoCallout, Skeleton } from '../components'
import { JsonDropZone } from '../components/json-drop-zone'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { undoLastImport } from '../hooks/ui-utilities'
import { type LayoutChoice, useDiagramCreate } from '../hooks/use-diagram-create'

const SP200 = 'var(--space-200)'

/**
 * Queue the first file from a drop event for import.
 * Kept exported for simple unit tests and future reuse.
 */
export function handleFileDrop(
  droppedFiles: File[],
  setImportQueue: React.Dispatch<React.SetStateAction<File[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
): void {
  if (droppedFiles.length === 0) return
  const file = droppedFiles[0]
  if (!file) return
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

export const StructuredTabV2: React.FC = () => {
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

  const handleFiles = React.useCallback((dropped: File[]) => {
    handleFileDrop(dropped, setImportQueue, setError)
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

  const selectTriggerStyle: React.CSSProperties = { width: '100%' }

  return (
    <TabPanel tabId="structured-v2">
      <PageHelp content="Flow or tree diagrams with advanced options" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: space[200] }}>
        <JsonDropZone onFiles={handleFiles} />
        {importQueue.length === 0 && (
          <EmptyState
            title="Drop a JSON file"
            description="Drag a JSON/CSV file to create a diagram."
          />
        )}
      </div>

      {importQueue.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: space[200] }}>
          <DroppedFileList>
            {importQueue.map((file) => (
              <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
            ))}
          </DroppedFileList>

          <fieldset
            style={{
              border: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: space[150],
            }}
          >
            <VisuallyHidden asChild>
              <legend>Diagram options</legend>
            </VisuallyHidden>

            {/* Layout type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-50)' }}>
              <label id="layout-type-label" style={{ fontWeight: 600 }}>
                Layout type
              </label>
              <Select.Root
                value={layoutChoice}
                onValueChange={(v) => {
                  setLayoutChoice(v)
                }}
              >
                <Select.Trigger aria-labelledby="layout-type-label" style={selectTriggerStyle} />
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

            {/* Frame toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-75)' }}>
                <Checkbox.Root
                  checked={withFrame}
                  onCheckedChange={(checked) => {
                    setWithFrame(checked)
                  }}
                >
                  <Checkbox.Indicator>✓</Checkbox.Indicator>
                </Checkbox.Root>
                Wrap items in frame
              </label>
              {withFrame && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-50)' }}>
                  <label htmlFor="frame-title" style={{ fontWeight: 600 }}>
                    Frame title
                  </label>
                  <Input
                    id="frame-title"
                    value={frameTitle}
                    onValueChange={(value) => {
                      setFrameTitle(value)
                    }}
                    placeholder="Frame title"
                  />
                </div>
              )}
            </div>

            <details
              open={showAdvanced}
              aria-label={ADVANCED_LABEL}
              onToggle={(event) => {
                setShowAdvanced((event.target as HTMLDetailsElement).open)
              }}
            >
              <summary aria-expanded={showAdvanced}>{ADVANCED_LABEL}</summary>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-150)',
                  paddingTop: 'var(--space-100)',
                }}
              >
                <InfoCallout title="Existing nodes">
                  Choose how existing items on the board are treated during layout. “Move into
                  place” repositions items, “Use for layout” anchors them, and “Keep position”
                  leaves them untouched.
                </InfoCallout>

                {/* Spacing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                  <label style={{ fontWeight: 600 }}>Spacing</label>
                  <Input
                    type="number"
                    value={String(layoutOptions.spacing)}
                    onValueChange={(v) => {
                      setLayoutOptions({ ...layoutOptions, spacing: Number(v) })
                    }}
                  />
                </div>

                {/* Aspect ratio */}
                {optionVisibility?.aspectRatio && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Aspect ratio</label>
                    <Select.Root
                      value={layoutOptions.aspectRatio}
                      onValueChange={(v) => {
                        setLayoutOptions({ ...layoutOptions, aspectRatio: v })
                      }}
                    >
                      <Select.Trigger style={selectTriggerStyle} />
                      <Select.Portal>
                        <Select.List>
                          {ASPECT_RATIOS.map((r) => (
                            <Select.Item key={r.id} value={r.id}>
                              <Select.ItemText>{r.label}</Select.ItemText>
                              <Select.ItemIndicator>✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                )}

                {/* Existing nodes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                  <label style={{ fontWeight: 600 }}>Existing nodes</label>
                  <Select.Root
                    value={existingMode}
                    onValueChange={(v) => {
                      setExistingMode(v)
                    }}
                  >
                    <Select.Trigger style={selectTriggerStyle} />
                    <Select.Portal>
                      <Select.List>
                        <Select.Item value="move">
                          <Select.ItemText>Move into place</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="layout">
                          <Select.ItemText>Use for layout</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="ignore">
                          <Select.ItemText>Keep position</Select.ItemText>
                        </Select.Item>
                      </Select.List>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Algorithm */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                  <label style={{ fontWeight: 600 }}>Algorithm</label>
                  <Select.Root
                    value={layoutOptions.algorithm}
                    onValueChange={(v) => {
                      setLayoutOptions({ ...layoutOptions, algorithm: v })
                    }}
                  >
                    <Select.Trigger style={selectTriggerStyle} />
                    <Select.Portal>
                      <Select.List>
                        {ALGORITHMS.map((a) => (
                          <Select.Item key={a} value={a}>
                            <Select.ItemText>{a}</Select.ItemText>
                            <Select.ItemIndicator>✓</Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Direction */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                  <label style={{ fontWeight: 600 }}>Direction</label>
                  <Select.Root
                    value={layoutOptions.direction}
                    onValueChange={(v) => {
                      setLayoutOptions({ ...layoutOptions, direction: v })
                    }}
                  >
                    <Select.Trigger style={selectTriggerStyle} />
                    <Select.Portal>
                      <Select.List>
                        {DIRECTIONS.map((d) => (
                          <Select.Item key={d} value={d}>
                            <Select.ItemText>{d}</Select.ItemText>
                            <Select.ItemIndicator>✓</Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Edge routing and extras */}
                {optionVisibility?.edgeRouting && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Edge routing</label>
                    <Select.Root
                      value={(layoutOptions.edgeRouting ?? 'default') as ElkEdgeRouting}
                      onValueChange={(v) => {
                        setLayoutOptions({ ...layoutOptions, edgeRouting: v })
                      }}
                    >
                      <Select.Trigger style={selectTriggerStyle} />
                      <Select.Portal>
                        <Select.List>
                          {EDGE_ROUTINGS.map((routing) => (
                            <Select.Item key={routing} value={routing}>
                              <Select.ItemText>{routing}</Select.ItemText>
                              <Select.ItemIndicator>✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                )}

                {optionVisibility?.edgeRoutingMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Routing mode</label>
                    <Select.Root
                      value={(layoutOptions.edgeRoutingMode ?? 'default') as ElkEdgeRoutingMode}
                      onValueChange={(v) => {
                        setLayoutOptions({
                          ...layoutOptions,
                          edgeRoutingMode: v,
                        })
                      }}
                    >
                      <Select.Trigger style={selectTriggerStyle} />
                      <Select.Portal>
                        <Select.List>
                          {EDGE_ROUTING_MODES.map((m) => (
                            <Select.Item key={m} value={m}>
                              <Select.ItemText>{m}</Select.ItemText>
                              <Select.ItemIndicator>✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                )}

                {optionVisibility?.optimizationGoal && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Optimisation goal</label>
                    <Select.Root
                      value={(layoutOptions.optimizationGoal ?? 'balanced') as ElkOptimizationGoal}
                      onValueChange={(v) => {
                        setLayoutOptions({
                          ...layoutOptions,
                          optimizationGoal: v,
                        })
                      }}
                    >
                      <Select.Trigger style={selectTriggerStyle} />
                      <Select.Portal>
                        <Select.List>
                          {OPTIMIZATION_GOALS.map((o) => (
                            <Select.Item key={o} value={o}>
                              <Select.ItemText>{o}</Select.ItemText>
                              <Select.ItemIndicator>✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                )}

                {layoutChoice === 'Nested' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Padding</label>
                    <Input
                      type="number"
                      value={String(nestedPadding)}
                      onValueChange={(v) => {
                        setNestedPadding(Number(v))
                      }}
                    />
                  </div>
                )}
                {layoutChoice === 'Nested' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-75)' }}>
                    <label style={{ fontWeight: 600 }}>Top spacing</label>
                    <Input
                      type="number"
                      value={String(nestedTopSpacing)}
                      onValueChange={(v) => {
                        setNestedTopSpacing(Number(v))
                      }}
                    />
                  </div>
                )}
              </div>
            </details>
          </fieldset>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
            <StickyActions>
              <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
                <BaseButton
                  onClick={() => {
                    void handleCreate()
                  }}
                  className="button button-primary"
                >
                  <IconPlus /> <Text>Create Diagram</Text>
                </BaseButton>
                {lastProc && (
                  <BaseButton
                    onClick={() => {
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }}
                    className="button button-secondary"
                  >
                    <IconArrowArcLeft /> <Text>Undo Last Import</Text>
                  </BaseButton>
                )}
              </div>
            </StickyActions>
            {progress > 0 && progress < 100 && (
              <output aria-label="Loading" style={{ display: 'block' }}>
                <Skeleton />
                <Skeleton />
              </output>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </section>
      )}
    </TabPanel>
  )
}

const ADVANCED_LABEL = 'Advanced options'

export default StructuredTabV2
