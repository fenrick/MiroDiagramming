import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Input } from '@base-ui-components/react/input'

import { lockSelectedFrames, renameSelectedFrames } from '../../board/frame-tools'
import { IconLockClosed, IconPen, Text } from '../primitives'
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
      <div className="stack-md">
        <PageHelp content="Rename or lock selected frames" />
        {!hasFrames && (
          <div className="stack-2xs">
            <h3 style={{ margin: 0 }}>No frames</h3>
            <p>{emptyStateDescription}</p>
          </div>
        )}

        <section className="stack-sm" title="Rename Frames">
          <InfoCallout title="Selection">{frameSummary}. Prefix updates left to right.</InfoCallout>
          <div className="stack-2xs" style={{ maxWidth: 280 }}>
            <span className="label">Prefix</span>
            <Input
              className="input"
              value={prefix}
              onValueChange={(value) => {
                setPrefix(value)
              }}
              placeholder="Prefix"
            />
          </div>
          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-primary"
                onClick={() => void rename()}
                disabled={!hasFrames}
              >
                <IconPen />
                <Text>Rename Frames</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>

        <section className="stack-sm" title="Lock Frames">
          <InfoCallout title="Note">Locking a frame also locks its content.</InfoCallout>
          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-secondary"
                onClick={() => void lock()}
                disabled={!hasFrames}
              >
                <IconLockClosed />
                <Text>Lock Selected</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export default FramesTabV2
