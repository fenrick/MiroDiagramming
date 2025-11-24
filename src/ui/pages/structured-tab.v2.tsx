import { Button } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Select } from '@base-ui-components/react/select'
import { Field } from '@base-ui-components/react/field'
import React from 'react'

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
import { DroppedFileList, EmptyState, InfoCallout, Skeleton, VisuallyHidden } from '../components'
import { JsonDropZone } from '../components/json-drop-zone'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { undoLastImport } from '../hooks/ui-utilities'
import { type LayoutChoice, useDiagramCreate } from '../hooks/use-diagram-create'

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

  return (
    <TabPanel tabId="structured-v2">
      <PageHelp content="Flow or tree diagrams with advanced options" />
      <div>
        <JsonDropZone onFiles={handleFiles} />
        {importQueue.length === 0 && (
          <EmptyState
            title="Drop a JSON file"
            description="Drag a JSON/CSV file to create a diagram."
          />
        )}
      </div>

      {importQueue.length > 0 && (
        <section>
          <DroppedFileList>
            {importQueue.map((file) => (
              <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
            ))}
          </DroppedFileList>

          <fieldset>
            <VisuallyHidden asChild>
              <legend>Diagram options</legend>
            </VisuallyHidden>

            {/* Layout type */}
            <Field.Root className="form-group form-group-small">
              <Field.Label id="layout-type-label">Layout type</Field.Label>
              <Field.Control
                render={(properties) => (
                  <Select.Root
                    value={layoutChoice}
                    onValueChange={(v) => {
                      setLayoutChoice(v)
                    }}
                  >
                    <Select.Trigger
                      {...properties}
                      aria-labelledby="layout-type-label"
                      className="input input-small"
                    />
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
                )}
              />
            </Field.Root>

            <InfoCallout title="Layout options">
              <ul>
                {LAYOUTS.map((l) => (
                  <li key={`desc-${l}`}>{LAYOUT_DESCRIPTION_MAP.get(l)}</li>
                ))}
              </ul>
            </InfoCallout>

            {/* Frame toggle */}
            <div className="form-group form-group-small">
              <label>
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
                <Field.Root className="form-group form-group-small">
                  <Field.Label htmlFor="frame-title">Frame title</Field.Label>
                  <Field.Control
                    id="frame-title"
                    className="input input-small"
                    value={frameTitle}
                    onValueChange={(value) => {
                      setFrameTitle(value)
                    }}
                    placeholder="Frame title"
                  />
                </Field.Root>
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
              <div>
                <InfoCallout title="Existing nodes">
                  Choose how existing items on the board are treated during layout. “Move into
                  place” repositions items, “Use for layout” anchors them, and “Keep position”
                  leaves them untouched.
                </InfoCallout>

                {/* Spacing */}
                <Field.Root className="form-group form-group-small">
                  <Field.Label>Spacing</Field.Label>
                  <Field.Control
                    className="input input-small"
                    type="number"
                    value={String(layoutOptions.spacing)}
                    onValueChange={(v) => {
                      setLayoutOptions({ ...layoutOptions, spacing: Number(v) })
                    }}
                  />
                </Field.Root>

                {/* Aspect ratio */}
                {optionVisibility?.aspectRatio && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Aspect ratio</Field.Label>
                    <Field.Control
                      render={(properties) => (
                        <Select.Root
                          value={layoutOptions.aspectRatio}
                          onValueChange={(v) => {
                            setLayoutOptions({ ...layoutOptions, aspectRatio: v })
                          }}
                        >
                          <Select.Trigger {...properties} className="input input-small" />
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
                      )}
                    />
                  </Field.Root>
                )}

                {/* Existing nodes */}
                <Field.Root className="form-group form-group-small">
                  <Field.Label>Existing nodes</Field.Label>
                  <Field.Control
                    render={(properties) => (
                      <Select.Root
                        value={existingMode}
                        onValueChange={(v) => {
                          setExistingMode(v)
                        }}
                      >
                        <Select.Trigger {...properties} className="input input-small" />
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
                    )}
                  />
                </Field.Root>

                {/* Algorithm */}
                <Field.Root className="form-group form-group-small">
                  <Field.Label>Algorithm</Field.Label>
                  <Field.Control
                    render={(properties) => (
                      <Select.Root
                        value={layoutOptions.algorithm}
                        onValueChange={(v) => {
                          setLayoutOptions({ ...layoutOptions, algorithm: v })
                        }}
                      >
                        <Select.Trigger {...properties} className="input input-small" />
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
                    )}
                  />
                </Field.Root>

                {/* Direction */}
                <Field.Root className="form-group form-group-small">
                  <Field.Label>Direction</Field.Label>
                  <Field.Control
                    render={(properties) => (
                      <Select.Root
                        value={layoutOptions.direction}
                        onValueChange={(v) => {
                          setLayoutOptions({ ...layoutOptions, direction: v })
                        }}
                      >
                        <Select.Trigger {...properties} className="input input-small" />
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
                    )}
                  />
                </Field.Root>

                {/* Edge routing and extras */}
                {optionVisibility?.edgeRouting && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Edge routing</Field.Label>
                    <Field.Control
                      render={(properties) => (
                        <Select.Root
                          value={(layoutOptions.edgeRouting ?? 'default') as ElkEdgeRouting}
                          onValueChange={(v) => {
                            setLayoutOptions({ ...layoutOptions, edgeRouting: v })
                          }}
                        >
                          <Select.Trigger {...properties} className="input input-small" />
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
                      )}
                    />
                  </Field.Root>
                )}

                {optionVisibility?.edgeRoutingMode && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Routing mode</Field.Label>
                    <Field.Control
                      render={(properties) => (
                        <Select.Root
                          value={(layoutOptions.edgeRoutingMode ?? 'default') as ElkEdgeRoutingMode}
                          onValueChange={(v) => {
                            setLayoutOptions({
                              ...layoutOptions,
                              edgeRoutingMode: v,
                            })
                          }}
                        >
                          <Select.Trigger {...properties} className="input input-small" />
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
                      )}
                    />
                  </Field.Root>
                )}

                {optionVisibility?.optimizationGoal && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Optimisation goal</Field.Label>
                    <Field.Control
                      render={(properties) => (
                        <Select.Root
                          value={
                            (layoutOptions.optimizationGoal ?? 'balanced') as ElkOptimizationGoal
                          }
                          onValueChange={(v) => {
                            setLayoutOptions({
                              ...layoutOptions,
                              optimizationGoal: v,
                            })
                          }}
                        >
                          <Select.Trigger {...properties} className="input input-small" />
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
                      )}
                    />
                  </Field.Root>
                )}

                {layoutChoice === 'Nested' && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Padding</Field.Label>
                    <Field.Control
                      className="input input-small"
                      type="number"
                      value={String(nestedPadding)}
                      onValueChange={(v) => {
                        setNestedPadding(Number(v))
                      }}
                    />
                  </Field.Root>
                )}
                {layoutChoice === 'Nested' && (
                  <Field.Root className="form-group form-group-small">
                    <Field.Label>Top spacing</Field.Label>
                    <Field.Control
                      className="input input-small"
                      type="number"
                      value={String(nestedTopSpacing)}
                      onValueChange={(v) => {
                        setNestedTopSpacing(Number(v))
                      }}
                    />
                  </Field.Root>
                )}
              </div>
            </details>
          </fieldset>

          <div>
            <StickyActions>
              <div>
                <Button
                  onClick={() => {
                    void handleCreate()
                  }}
                  className="button button-primary button-medium"
                >
                  <span className="icon icon-plus" aria-hidden="true"></span>
                  <p className="p-medium">Create Diagram</p>
                </Button>
                {lastProc && (
                  <Button
                    onClick={() => {
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }}
                    className="button button-secondary button-medium"
                  >
                    <span className="icon icon-undo" aria-hidden="true"></span>
                    <p className="p-medium">Undo Last Import</p>
                  </Button>
                )}
              </div>
            </StickyActions>
            {progress > 0 && progress < 100 && (
              <output aria-label="Loading">
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
