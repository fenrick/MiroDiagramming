import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Input } from '@base-ui-components/react/input'

import { space } from '@mirohq/design-tokens'
import { IconArrowArcLeft, IconChevronRightDouble, Text } from '../primitives'

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

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

const EXISTING_MODE_OPTIONS: readonly { id: ExistingNodeMode; label: string }[] = [
  { id: 'move', label: 'Move into new layout' },
  { id: 'layout', label: 'Use selection positions' },
  { id: 'ignore', label: 'Keep existing positions' },
]

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

  const handleRender = React.useCallback(async () => {
    if (isDefinitionEmpty) {
      setStatus({ variant: 'error', message: 'Add a Mermaid definition before rendering.' })
      return
    }
    const renderer = rendererReference.current
    setIsRendering(true)
    setStatus(null)
    try {
      const graph = await renderer.render(trimmedDefinition, {
        createFrame: withFrame,
        frameTitle: withFrame ? frameTitle.trim() || undefined : undefined,
        existingMode,
      })
      const nodeCount = graph.nodes.length
      const edgeCount = graph.edges.length
      setStatus({
        variant: 'success',
        message: `Rendered ${String(nodeCount)} node${nodeCount === 1 ? '' : 's'} and ${String(
          edgeCount,
        )} edge${edgeCount === 1 ? '' : 's'} on the board.`,
      })
    } catch (error) {
      if (error instanceof MermaidConversionError) {
        setStatus({ variant: 'error', message: error.message })
      } else {
        setStatus({
          variant: 'error',
          message: 'Unable to render diagram. Check the console for details.',
        })
      }
      log.error({ error }, 'Mermaid rendering failed')
    } finally {
      setIsRendering(false)
    }
  }, [existingMode, frameTitle, isDefinitionEmpty, trimmedDefinition, withFrame])

  return (
    <TabPanel tabId="mermaid">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Transform Mermaid flowcharts into board widgets" />
        <section className="stack-sm" title="Definition">
          <InfoCallout title="Supported diagrams">
            Mermaid flowcharts (`graph TD`/`graph LR`) are supported today. Sequence diagrams and
            other formats are on the roadmap.
          </InfoCallout>
          <label className="stack-2xs">
            <span className="label">Mermaid definition</span>
            <textarea
              className="textarea"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="graph TD\nA[Start] --> B[Finish]"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <div className="button-group">
            <BaseButton className="button button-secondary" onClick={handleSample}>
              <IconChevronRightDouble />
              Use Sample
            </BaseButton>
            <BaseButton className="button button-ghost" onClick={handleClear}>
              <IconArrowArcLeft />
              Clear
            </BaseButton>
          </div>
        </section>

        <section className="stack-sm" title="Options">
          <label className="inline-field">
            <Checkbox.Root
              checked={withFrame}
              onCheckedChange={(checked) => setWithFrame(Boolean(checked))}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Wrap result in a frame</span>
          </label>
          {withFrame ? (
            <label className="stack-2xs" style={{ maxWidth: 320 }}>
              <span className="label">Frame title</span>
              <Input
                className="input"
                value={frameTitle}
                onValueChange={(v) => setFrameTitle(String(v))}
                placeholder="Optional frame title"
              />
            </label>
          ) : null}

          <label className="stack-2xs" style={{ maxWidth: 320 }}>
            <span className="label">Existing selection</span>
            <select
              className="input"
              value={existingMode}
              onChange={(event) => setExistingMode(event.target.value as ExistingNodeMode)}
            >
              {EXISTING_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p>
            Move into new layout repositions selected widgets to match the rendered graph. Use
            selection positions to keep coordinates for matched nodes while laying out new ones.
          </p>
        </section>

        {status ? (
          <div
            style={{
              padding: 'var(--space-150)',
              borderRadius: 'var(--border-radius-medium)',
              border: `1px solid ${
                status.variant === 'success' ? 'var(--colors-green-400)' : 'var(--colors-red-400)'
              }`,
              background:
                status.variant === 'success' ? 'var(--colors-green-100)' : 'var(--colors-red-100)',
              color:
                status.variant === 'success' ? 'var(--colors-green-700)' : 'var(--colors-red-700)',
            }}
          >
            <output aria-live="polite">{status.message}</output>
          </div>
        ) : null}
        <StickyActions>
          <div className="button-group">
            <BaseButton
              className="button button-primary"
              onClick={() => void handleRender()}
              disabled={isRendering || isDefinitionEmpty}
            >
              <IconChevronRightDouble />
              <Text>{isRendering ? 'Rendering…' : 'Render to Board'}</Text>
            </BaseButton>
          </div>
        </StickyActions>
      </div>
    </TabPanel>
  )
}

export default MermaidTabV2
