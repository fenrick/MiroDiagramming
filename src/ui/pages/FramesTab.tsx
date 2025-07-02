import React from 'react';
import { InputField, Text, Heading } from '../components/legacy';
import { Button } from '../components/Button';
import {
  lockSelectedFrames,
  renameSelectedFrames,
} from '../../board/frame-tools';
import { TabPanel } from '../components/TabPanel';
import { TabGrid } from '../components/TabGrid';
import type { TabTuple } from './tab-definitions';

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
      <TabGrid columns={2}>
        <section>
          <Heading level={2}>Rename Frames</Heading>
          <InputField label='Prefix'>
            <input
              className='input input-small'
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder='Prefix'
            />
          </InputField>
          <div className='buttons'>
            <Button
              icon='edit'
              onClick={rename}
              variant='primary'>
              <Text>Rename Frames</Text>
            </Button>
          </div>
        </section>
        <section>
          <Heading level={2}>Lock Frames</Heading>
          <div className='buttons'>
            <Button
              icon='lock'
              onClick={lock}
              variant='secondary'>
              <Text>Lock Selected</Text>
            </Button>
          </div>
        </section>
      </TabGrid>
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
