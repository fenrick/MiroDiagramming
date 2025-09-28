import { Grid, IconLockClosed, IconPen, Text } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { lockSelectedFrames, renameSelectedFrames } from '../../board/frame-tools'
import {
  Button,
  ButtonToolbar,
  InputField,
  SidebarSection,
  EmptyState,
  InfoCallout,
} from '../components'
import { StickyActions } from '../sticky-actions'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { useSelection } from '../hooks/use-selection'

import type { TabTuple } from './tab-definitions'

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

const isFrame = (item: Record<string, unknown>): boolean =>
  (item as { type?: string }).type === 'frame'

export const FramesTab: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-')
  const selection = useSelection()
  const frames = React.useMemo(() => selection.filter((item) => isFrame(item)), [selection])
  const hasFrames = frames.length > 0
  const hasSelection = selection.length > 0
  const emptyStateDescription = hasSelection
    ? 'Current selection has no frames. Select one or more frames to proceed.'
    : 'Select one or more frames to proceed.'
  let frameSummary = 'No frames selected'
  if (hasFrames) {
    const count = frames.length
    const suffix = count === 1 ? '' : 's'
    frameSummary = `${count} frame${suffix} selected`
  }

  const rename = React.useCallback(async (): Promise<void> => {
    if (!hasFrames) {
      return
    }
    await renameSelectedFrames({ prefix })
  }, [hasFrames, prefix])

  const lock = React.useCallback(async (): Promise<void> => {
    if (!hasFrames) {
      return
    }
    await lockSelectedFrames()
  }, [hasFrames])

  return (
    <TabPanel tabId="frames">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Rename or lock selected frames" />
        {hasFrames ? null : <EmptyState title="No frames" description={emptyStateDescription} />}
        <SidebarSection title="Rename Frames">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="Selection">
              {frameSummary}. Prefix updates from left to right.
            </InfoCallout>
          </div>
          <Grid columns={2}>
            <Grid.Item>
              <InputField
                label="Prefix"
                value={prefix}
                onValueChange={(v) => setPrefix(v)}
                placeholder="Prefix"
              />
            </Grid.Item>
            <Grid.Item>
              <StickyActions>
                <ButtonToolbar>
                  <Button
                    onClick={rename}
                    variant="primary"
                    iconPosition="start"
                    icon={<IconPen />}
                    disabled={!hasFrames}
                  >
                    <Text>Rename Frames</Text>
                  </Button>
                </ButtonToolbar>
              </StickyActions>
            </Grid.Item>
          </Grid>
        </SidebarSection>
        <SidebarSection title="Lock Frames">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="Note">Locking a frame also locks its content.</InfoCallout>
          </div>
          <StickyActions>
            <ButtonToolbar>
              <Button
                onClick={lock}
                variant="secondary"
                iconPosition="start"
                icon={<IconLockClosed />}
                disabled={!hasFrames}
              >
                <Text>Lock Selected</Text>
              </Button>
            </ButtonToolbar>
          </StickyActions>
        </SidebarSection>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  2,
  'frames',
  'Frames',
  'Rename or lock selected frames',
  FramesTab,
]
