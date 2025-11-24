import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'

import { trimSelectedShapeText } from '../../board/text-tools'
import { IconPen, Text } from '../primitives'
import { InfoCallout } from '../components/info-callout'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'
import { pushToast } from '../components/toast'
import { showError } from '../hooks/notifications'

const formatSelectionSummary = (count: number): string => {
  if (count <= 0) return 'No items selected'
  const suffix = count === 1 ? '' : 's'
  return `${count.toLocaleString()} item${suffix} selected`
}

export const TextTabV2: React.FC = () => {
  const selection = useSelection()
  const hasTargets = selection.length > 0
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
      console.error(error)
    } finally {
      setBusy(false)
    }
  }, [hasTargets])

  const emptyStateDescription = hasTargets
    ? 'Current selection has no shapes or stickies. Select one or more to tidy their text.'
    : 'Select one or more shapes or stickies to tidy their text.'

  return (
    <TabPanel tabId="text">
      <div className="stack-md">
        <PageHelp content="Clean up text on selected items" />
        {!hasTargets && (
          <div className="stack-2xs">
            <h3 style={{ margin: 0 }}>No selection</h3>
            <p>{emptyStateDescription}</p>
          </div>
        )}

        <section className="stack-sm" title="Text Cleanup">
          <InfoCallout title="What it does">
            Trims whitespace from the start and end of each recognised text field (plain text or
            simple HTML like &lt;p&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;span&gt;,
            &lt;br&gt;). {targetSummary}.
          </InfoCallout>

          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-primary"
                onClick={handleTrim}
                disabled={!hasTargets || busy}
              >
                <IconPen />
                <Text>{busy ? 'Trimming…' : 'Trim Text'}</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export default TextTabV2
