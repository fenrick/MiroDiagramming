import React from 'react'
import { Button } from '@base-ui-components/react/button'
import { Field } from '@base-ui-components/react/field'

import { lockSelectedFrames, renameSelectedFrames } from '../../board/frame-tools'
import { InfoCallout } from '../components/info-callout'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'

const isFrame = (item: Record<string, unknown>): boolean =>
  (item as { type?: string }).type === 'frame'

const formatFrameSummary = (count: number): string => {
  if (count <= 0) return 'No frames selected'
  const suffix = count === 1 ? '' : 's'
  return `${count.toLocaleString()} frame${suffix} selected`
}

export const FramesTabV2: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-')
  const selection = useSelection()
  const frames = React.useMemo(() => selection.filter((item) => isFrame(item)), [selection])
  const hasFrames = frames.length > 0
  const hasSelection = selection.length > 0
  const emptyStateDescription = hasSelection
    ? 'Current selection has no frames. Select one or more frames to proceed.'
    : 'Select one or more frames to proceed.'
  const frameSummary = formatFrameSummary(frames.length)

  const rename = React.useCallback(async (): Promise<void> => {
    if (!hasFrames) return
    await renameSelectedFrames({ prefix })
  }, [hasFrames, prefix])

  const lock = React.useCallback(async (): Promise<void> => {
    if (!hasFrames) return
    await lockSelectedFrames()
  }, [hasFrames])

  return (
    <TabPanel tabId="frames">
      <div>
        <PageHelp content="Rename or lock selected frames" />
        {!hasFrames && (
          <div>
            <h3>No frames</h3>
            <p>{emptyStateDescription}</p>
          </div>
        )}

        <section title="Rename Frames">
          <InfoCallout title="Selection">{frameSummary}. Prefix updates left to right.</InfoCallout>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Prefix</Field.Label>
            <Field.Control
              className="input input-small"
              value={prefix}
              onValueChange={(value) => {
                setPrefix(value)
              }}
              placeholder="Prefix"
            />
          </Field.Root>
          <StickyActions>
            <Button
              className="button button-primary button-medium"
              onClick={() => void rename()}
              disabled={!hasFrames}
            >
              <span className="icon icon-edit" aria-hidden="true"></span>
              <p className="p-medium">Rename Frames</p>
            </Button>
          </StickyActions>
        </section>

        <section title="Lock Frames">
          <InfoCallout title="Note">Locking a frame also locks its content.</InfoCallout>
          <StickyActions>
            <Button
              className="button button-secondary button-medium"
              onClick={() => void lock()}
              disabled={!hasFrames}
            >
              <span className="icon icon-lock" aria-hidden="true"></span>
              <p className="p-medium">Lock Selected</p>
            </Button>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export default FramesTabV2
