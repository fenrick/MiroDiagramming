import {
  Button,
  Callout,
  IconArrowArcLeft,
  IconChevronRightDouble,
  Text,
} from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { type ExistingNodeMode } from '../../core/graph/graph-processor'
import { usePersistentState } from '../../core/hooks/use-persistent-state'
import { MermaidConversionError, MermaidRenderer } from '../../core/mermaid'
import * as log from '../../logger'
import {
  ButtonToolbar,
  Checkbox,
  InfoCallout,
  InputField,
  PageHelp,
  Paragraph,
  SelectField,
  SelectOption,
  SidebarSection,
  TabPanel,
  TextareaField,
} from '../components'
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

const STATUS_STYLE: React.CSSProperties = {
  marginTop: space[100],
}

const EXISTING_MODE_OPTIONS: readonly { id: ExistingNodeMode; label: string }[] = [
  { id: 'move', label: 'Move into new layout' },
  { id: 'layout', label: 'Use selection positions' },
  { id: 'ignore', label: 'Keep existing positions' },
]

export const MermaidTab: React.FC = () => {
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
        <SidebarSection title="Definition">
          <InfoCallout title="Supported diagrams">
            Mermaid flowcharts (`graph TD`/`graph LR`) are supported today. Sequence diagrams and
            other formats are on the roadmap.
          </InfoCallout>
          <TextareaField
            label="Mermaid definition"
            value={definition}
            onValueChange={setDefinition}
            placeholder="graph TD\nA[Start] --> B[Finish]"
            spellCheck={false}
            autoComplete="off"
          />
          <ButtonToolbar>
            <Button onClick={handleSample} variant="secondary" icon={<IconChevronRightDouble />}>
              Use Sample
            </Button>
            <Button onClick={handleClear} variant="ghost" icon={<IconArrowArcLeft />}>
              Clear
            </Button>
          </ButtonToolbar>
        </SidebarSection>
        <SidebarSection title="Options">
          <Checkbox label="Wrap result in a frame" value={withFrame} onChange={setWithFrame} />
          {withFrame ? (
            <InputField
              label="Frame title"
              value={frameTitle}
              onValueChange={setFrameTitle}
              placeholder="Optional frame title"
            />
          ) : null}
          <SelectField
            label="Existing selection"
            value={existingMode}
            onChange={(value) => {
              setExistingMode(value as ExistingNodeMode)
            }}
          >
            {EXISTING_MODE_OPTIONS.map((option) => (
              <SelectOption key={option.id} value={option.id}>
                {option.label}
              </SelectOption>
            ))}
          </SelectField>
          <Paragraph>
            Move into new layout repositions selected widgets to match the rendered graph. Use
            selection positions to keep coordinates for matched nodes while laying out new ones.
          </Paragraph>
        </SidebarSection>
        {status ? (
          <Callout
            variant={status.variant === 'success' ? 'success' : 'danger'}
            dismissible={false}
            style={STATUS_STYLE}
          >
            <Callout.Content>
              <Callout.Description>
                <output aria-live="polite">{status.message}</output>
              </Callout.Description>
            </Callout.Content>
          </Callout>
        ) : null}
        <StickyActions>
          <ButtonToolbar>
            <Button
              onClick={() => {
                void handleRender()
              }}
              variant="primary"
              iconPosition="start"
              icon={<IconChevronRightDouble />}
              disabled={isRendering || isDefinitionEmpty}
            >
              <Text>{isRendering ? 'Rendering…' : 'Render to Board'}</Text>
            </Button>
          </ButtonToolbar>
        </StickyActions>
      </div>
    </TabPanel>
  )
}
