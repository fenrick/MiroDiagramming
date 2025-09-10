import { Grid, Heading, IconLockClosed, IconPen, Text } from '@mirohq/design-system'
import React from 'react'
import { lockSelectedFrames, renameSelectedFrames } from '../../board/frame-tools'
import { Button, ButtonToolbar, InputField } from '../components'
import { StickyActions } from '../StickyActions'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'
import type { TabTuple } from './tab-definitions'

/** UI for renaming or locking selected frames. */
export const FramesTab: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-')
  const rename = async (): Promise<void> => await renameSelectedFrames({ prefix })
  /** Lock selected frames and their contents. */
  const lock = async (): Promise<void> => await lockSelectedFrames()
  return (
    <TabPanel tabId="frames">
      <PageHelp content="Rename or lock selected frames" />
      <Grid columns={2}>
        <Grid.Item>
          <Heading level={2}>Rename Frames</Heading>
        </Grid.Item>
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
        <Grid.Item>
          <Heading level={2}>Lock Frames</Heading>
        </Grid.Item>
        <Grid.Item>
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
        </Grid.Item>
      </Grid>
    </TabPanel>
  )
}

export const tabDef: TabTuple = [2, 'frames', 'Frames', 'Rename or lock selected frames', FramesTab]
