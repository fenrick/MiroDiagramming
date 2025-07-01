import React from 'react';
import { Button, Icon, InputField, Text } from '../components/legacy';
import {
  lockSelectedFrames,
  renameSelectedFrames,
} from '../../board/frame-tools';
import { TabPanel } from '../components/TabPanel';
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
      <div>
        <fieldset>
          <legend>Rename Frames</legend>
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
              onClick={rename}
              variant='primary'>
              <React.Fragment key='.0'>
                <Icon name='edit' />
                <Text>Rename Frames</Text>
              </React.Fragment>
            </Button>
          </div>
        </fieldset>
        <fieldset>
          <legend>Lock Frames</legend>
          <div className='buttons'>
            <Button
              onClick={lock}
              variant='secondary'>
              <React.Fragment key='.1'>
                <Icon name='lock' />
                <Text>Lock Selected</Text>
              </React.Fragment>
            </Button>
          </div>
        </fieldset>
      </div>
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
