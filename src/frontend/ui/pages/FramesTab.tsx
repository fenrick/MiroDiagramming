import { Grid, IconLockClosed, IconPen, Text } from '@mirohq/design-system'
import React from 'react'

import { lockSelectedFrames, renameSelectedFrames } from '../../board/frame-tools'
import { Button, ButtonToolbar, InputField, SidebarSection, EmptyState } from '../components'
import { StickyActions } from '../StickyActions'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'

import type { TabTuple } from './tab-definitions'

/** UI for renaming or locking selected frames. */
export const FramesTab: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-')
  const [selectionCount, setSelectionCount] = React.useState(0)
  React.useEffect(() => {
    let cancelled = false
    const sub = setInterval(async () => {
      try {
        const items = await globalThis.miro?.board?.getSelection?.()
        if (!cancelled) setSelectionCount(Array.isArray(items) ? items.length : 0)
      } catch {}
    }, 600)
    return () => {
      cancelled = true
      clearInterval(sub)
    }
  }, [])
  const rename = async (): Promise<void> => await renameSelectedFrames({ prefix })
  /** Lock selected frames and their contents. */
  const lock = async (): Promise<void> => await lockSelectedFrames()
  return (
    <TabPanel tabId="frames">
      <PageHelp content="Rename or lock selected frames" />
      {selectionCount === 0 ? (
        <EmptyState title="No selection" description="Select one or more frames to proceed." />
      ) : null}
      <SidebarSection title="Rename Frames">
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
                <Button onClick={rename} variant="primary" iconPosition="start" icon={<IconPen />}>
                  <Text>Rename Frames</Text>
                </Button>
              </ButtonToolbar>
            </StickyActions>
          </Grid.Item>
        </Grid>
      </SidebarSection>
      <SidebarSection title="Lock Frames">
        <StickyActions>
          <ButtonToolbar>
            <Button
              onClick={lock}
              variant="secondary"
              iconPosition="start"
              icon={<IconLockClosed />}
            >
              <Text>Lock Selected</Text>
            </Button>
          </ButtonToolbar>
        </StickyActions>
      </SidebarSection>
    </TabPanel>
  )
}

export const tabDef: TabTuple = [2, 'frames', 'Frames', 'Rename or lock selected frames', FramesTab]
