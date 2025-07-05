import React from 'react';
import { Button, InputField } from '../components';
import {
  lockSelectedFrames,
  renameSelectedFrames,
} from '../../board/frame-tools';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';
import {
  Grid,
  Heading,
  IconLockClosed,
  IconPen,
  Text,
} from '@mirohq/design-system';

/** UI for renaming or locking selected frames. */
export const FramesTab: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-');
  const rename = async (): Promise<void> => {
    await renameSelectedFrames({ prefix });
  };
  /** Lock selected frames and their contents. */
  const lock = async (): Promise<void> => {
    await lockSelectedFrames();
  };
  return (
    <TabPanel tabId='frames'>
      <Grid columns={2}>
        <Grid.Item>
          <Heading level={2}>Rename Frames</Heading>
        </Grid.Item>
        <Grid.Item>
          <InputField
            label='Prefix'
            value={prefix}
            onValueChange={(v) => setPrefix(v)}
            placeholder='Prefix'
          />
        </Grid.Item>
        <Grid.Item>
          <div className='buttons'>
            <Button
              onClick={rename}
              variant='primary'
              iconPosition='start'
              icon={<IconPen />}>
              <Text>Rename Frames</Text>
            </Button>
          </div>
        </Grid.Item>
        <Grid.Item>
          <Heading level={2}>Lock Frames</Heading>
        </Grid.Item>
        <Grid.Item>
          <div className='buttons'>
            <Button
              onClick={lock}
              variant='secondary'
              iconPosition='start'
              icon={<IconLockClosed />}>
              <Text>Lock Selected</Text>
            </Button>
          </div>
        </Grid.Item>
      </Grid>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  2,
  'frames',
  'Frames',
  'Rename or lock selected frames',
  FramesTab,
];
