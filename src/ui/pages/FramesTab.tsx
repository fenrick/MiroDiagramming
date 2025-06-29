import React from 'react';
import { Button, Icon, InputField, Text } from '../components/legacy';
import { renameSelectedFrames } from '../../board/frame-tools';
import type { TabTuple } from './tab-definitions';

/** UI for renaming selected frames. */
export const FramesTab: React.FC = () => {
  const [prefix, setPrefix] = React.useState('Frame-');
  const rename = (): void => {
    void renameSelectedFrames({ prefix });
  };
  return (
    <div>
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
    </div>
  );
};

export const tabDef: TabTuple = [
  2,
  'frames',
  'Frames',
  'Rename selected frames',
  FramesTab,
];
