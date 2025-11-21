import { space } from '@mirohq/design-tokens'
import React from 'react'

import { trimSelectedShapeText } from '../../board/text-tools'
import { Grid, IconPen, Text } from '../primitives'
import { Button, ButtonToolbar, EmptyState, InfoCallout, SidebarSection } from '../components'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'
import { pushToast } from '../components/toast'
import { showError } from '../hooks/notifications'

import type { TabTuple } from './tab-definitions'

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

const formatSelectionSummary = (count: number): string => {
  if (count <= 0) {
    return 'No items selected'
  }
  const suffix = count === 1 ? '' : 's'
  return `${count.toLocaleString()} item${suffix} selected`
}

export const TextTab: React.FC = () => {
  const selection = useSelection()
  const hasTargets = selection.length > 0
  const hasSelection = selection.length > 0
  const targetSummary = formatSelectionSummary(selection.length)

  const [busy, setBusy] = React.useState(false)

  const handleTrim = React.useCallback(async (): Promise<void> => {
    if (!hasTargets) {
      pushToast({ message: 'Select one or more items to trim.' })
      return
    }
    setBusy(true)
    try {
      const { widgetsTouched, fieldsTrimmed } = await trimSelectedShapeText()
      if (fieldsTrimmed === 0) {
        pushToast({ message: 'No leading/trailing whitespace found.' })
      } else {
        const pluralWidgets = widgetsTouched === 1 ? '' : 's'
        const pluralFields = fieldsTrimmed === 1 ? '' : 's'
        pushToast({
          message: `Trimmed ${fieldsTrimmed.toLocaleString()} field${pluralFields} on ${widgetsTouched.toLocaleString()} widget${pluralWidgets}.`,
        })
      }
    } catch (error) {
      showError('Unable to trim text. Please try again in this board.')
      // eslint-disable-next-line no-console -- surfaced for debugging when notifications may be suppressed
      console.error(error)
    } finally {
      setBusy(false)
    }
  }, [hasTargets])

  const emptyStateDescription = hasSelection
    ? 'Current selection has no shapes or stickies. Select one or more to tidy their text.'
    : 'Select one or more shapes or stickies to tidy their text.'

  return (
    <TabPanel tabId="text">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Clean up text on selected items" />
        {hasTargets ? null : (
          <EmptyState title="No selection" description={emptyStateDescription} />
        )}
        <section title="Text Cleanup">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="What it does">
              Trims whitespace from the start and end of each recognised text field (plain text or
              simple HTML like &lt;p&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;span&gt;,
              &lt;br&gt;). {targetSummary}.
            </InfoCallout>
          </div>
          <Grid columns={2}>
            <Grid.Item>
              <StickyActions>
                <ButtonToolbar>
                  <Button
                    onClick={handleTrim}
                    variant="primary"
                    iconPosition="start"
                    icon={<IconPen />}
                    disabled={!hasTargets || busy}
                  >
                    <Text>{busy ? 'Trimming…' : 'Trim Text'}</Text>
                  </Button>
                </ButtonToolbar>
              </StickyActions>
            </Grid.Item>
          </Grid>
        </section>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  6,
  'text',
  'Text',
  'Clean up text on selected shapes',
  TextTab,
]
