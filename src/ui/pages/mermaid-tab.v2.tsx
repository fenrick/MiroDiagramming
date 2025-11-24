import React from 'react'
import { Button } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Field } from '@base-ui-components/react/field'

import { type ExistingNodeMode } from '../../core/graph/graph-processor'
import { usePersistentState } from '../../core/hooks/use-persistent-state'
import { MermaidConversionError, MermaidRenderer } from '../../core/mermaid'
import * as log from '../../logger'
import { InfoCallout, PageHelp, TabPanel } from '../components'
import { StickyActions } from '../sticky-actions'

const STORAGE_KEY = 'miro.mermaid.definition'
const WITH_FRAME_STORAGE_KEY = 'miro.mermaid.withFrame'
const SAMPLE_DEFINITION = `graph TD
  Start[Start] --> Decision{Review proposal}
  Decision -->|Approve| Launch[Launch project]
  Decision -->|Revise| Iterate[Collect feedback]
  Iterate --> Decision
  Launch --> Celebrate[(Celebrate!)]`

const EXISTING_MODE_OPTIONS: readonly { id: ExistingNodeMode; label: string }[] = [
  { id: 'move', label: 'Move into new layout' },
  { id: 'layout', label: 'Use selection positions' },
  { id: 'ignore', label: 'Keep existing positions' },
]

type MermaidOptionsProperties = Readonly<{
  withFrame: boolean
  frameTitle: string
  existingMode: ExistingNodeMode
  onToggleFrame: (checked: boolean) => void
  onFrameTitleChange: (value: string) => void
  onExistingModeChange: (mode: ExistingNodeMode) => void
}>

const MermaidOptions = ({
  withFrame,
  frameTitle,
  existingMode,
  onToggleFrame,
  onFrameTitleChange,
  onExistingModeChange,
}: MermaidOptionsProperties): React.JSX.Element => (
  <section title="Options">
    <label className="inline-field form-group form-group-small">
      <Checkbox.Root checked={withFrame} onCheckedChange={onToggleFrame} className="checkbox">
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Root>
      <span>Wrap result in a frame</span>
    </label>
    {withFrame ? (
      <Field.Root className="form-group form-group-small">
        <Field.Label>Frame title</Field.Label>
        <Field.Control
          className="input input-small"
          value={frameTitle}
          onValueChange={onFrameTitleChange}
          placeholder="Optional frame title"
        />
      </Field.Root>
    ) : null}

    <Field.Root className="form-group form-group-small">
      <Field.Label>Existing selection</Field.Label>
      <Field.Control
        render={(properties) => (
          <select
            {...properties}
            className="input input-small"
            value={existingMode}
            onChange={(event) => {
              onExistingModeChange(event.target.value as ExistingNodeMode)
            }}
          >
            {EXISTING_MODE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
    </Field.Root>
    <p>
      Move into new layout repositions selected widgets to match the rendered graph. Use selection
      positions to keep coordinates for matched nodes while laying out new ones.
    </p>
  </section>
)

const buildSuccessMessage = (nodes: number, edges: number): string => {
  const nodeSuffix = nodes === 1 ? '' : 's'
  const edgeSuffix = edges === 1 ? '' : 's'
  const nodeLabel = nodes.toLocaleString()
  const edgeLabel = edges.toLocaleString()
  return `Rendered ${nodeLabel} node${nodeSuffix} and ${edgeLabel} edge${edgeSuffix} on the board.`
}

const handleRenderError = (
  error: unknown,
  setStatus: React.Dispatch<
    React.SetStateAction<
      { variant: 'success'; message: string } | { variant: 'error'; message: string } | null
    >
  >,
): void => {
  if (error instanceof MermaidConversionError) {
    setStatus({ variant: 'error', message: error.message })
    return
  }
  setStatus({
    variant: 'error',
    message: 'Unable to render diagram. Check the console for details.',
  })
  log.error({ error }, 'Mermaid rendering failed')
}

export const MermaidTabV2: React.FC = () => {
  const [definition, setDefinition] = usePersistentState<string>(STORAGE_KEY, SAMPLE_DEFINITION)
  const [withFrame, setWithFrame] = usePersistentState<boolean>(WITH_FRAME_STORAGE_KEY, false)
  const [frameTitle, setFrameTitle] = React.useState('')
  const [existingMode, setExistingMode] = React.useState<ExistingNodeMode>('move')
  const [isRendering, setIsRendering] = React.useState(false)
  const [status, setStatus] = React.useState<
    { variant: 'success'; message: string } | { variant: 'error'; message: string } | null
  >(null)

  const rendererReference = React.useRef<MermaidRenderer>(new MermaidRenderer())

  const trimmedDefinition = definition.trim()
  const isDefinitionEmpty = trimmedDefinition.length === 0

  const handleSample = React.useCallback(() => {
    setDefinition(SAMPLE_DEFINITION)
    setStatus(null)
  }, [])

  const handleClear = React.useCallback(() => {
    setDefinition('')
    setStatus(null)
  }, [])

  const renderOptions = React.useMemo(
    () => ({
      createFrame: withFrame,
      frameTitle: withFrame ? frameTitle.trim() || undefined : undefined,
      existingMode,
    }),
    [existingMode, frameTitle, withFrame],
  )

  const renderGraph = React.useCallback(async (): Promise<void> => {
    const renderer = rendererReference.current
    const graph = await renderer.render(trimmedDefinition, renderOptions)
    setStatus({
      variant: 'success',
      message: buildSuccessMessage(graph.nodes.length, graph.edges.length),
    })
  }, [renderOptions, trimmedDefinition])

  const handleRender = React.useCallback(async () => {
    if (isDefinitionEmpty) {
      setStatus({ variant: 'error', message: 'Add a Mermaid definition before rendering.' })
      return
    }
    setIsRendering(true)
    setStatus(null)
    try {
      await renderGraph()
    } catch (error) {
      handleRenderError(error, setStatus)
    } finally {
      setIsRendering(false)
    }
  }, [isDefinitionEmpty, renderGraph])

  return (
    <TabPanel tabId="mermaid">
      <div>
        <PageHelp content="Transform Mermaid flowcharts into board widgets" />
        <section title="Definition">
          <InfoCallout title="Supported diagrams">
            Mermaid flowcharts (`graph TD`/`graph LR`) are supported today. Sequence diagrams and
            other formats are on the roadmap.
          </InfoCallout>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Mermaid definition</Field.Label>
            <Field.Control
              render={(properties) => (
                <textarea
                  {...properties}
                  className="textarea"
                  value={definition}
                  onChange={(event) => {
                    setDefinition(event.target.value)
                  }}
                  placeholder="graph TD\nA[Start] --> B[Finish]"
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            />
          </Field.Root>
          <div>
            <Button className="button button-secondary button-medium" onClick={handleSample}>
              <span className="icon icon-arrow-right" aria-hidden="true"></span>
              <p className="p-medium">Use Sample</p>
            </Button>
            <Button className="button button-ghost button-medium" onClick={handleClear}>
              <span className="icon icon-undo" aria-hidden="true"></span>
              <p className="p-medium">Clear</p>
            </Button>
          </div>
        </section>

        <MermaidOptions
          withFrame={withFrame}
          frameTitle={frameTitle}
          existingMode={existingMode}
          onToggleFrame={(checked) => {
            setWithFrame(checked)
          }}
          onFrameTitleChange={(value) => {
            setFrameTitle(value)
          }}
          onExistingModeChange={(mode) => {
            setExistingMode(mode)
          }}
        />

        {status ? (
          <div>
            <output aria-live="polite">{status.message}</output>
          </div>
        ) : null}
        <StickyActions>
          <Button
            className="button button-primary button-medium"
            onClick={() => void handleRender()}
            disabled={isRendering || isDefinitionEmpty}
          >
            <span className="icon icon-arrows-right" aria-hidden="true"></span>
            <p className="p-medium">{isRendering ? 'Rendering…' : 'Render to Board'}</p>
          </Button>
        </StickyActions>
      </div>
    </TabPanel>
  )
}

export default MermaidTabV2
