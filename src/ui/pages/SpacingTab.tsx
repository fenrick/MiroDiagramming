import React from 'react';
import { Button, Input, InputLabel, Icon, Text } from '../components/legacy';
import { SegmentedControl } from '../components/SegmentedControl';
import { applySpacingLayout, SpacingOptions } from '../../board/spacing-tools';

import type { TabTuple } from './tab-definitions';
/** UI for evenly spacing selected items. */
export const SpacingTab: React.FC = () => {
  const [opts, setOpts] = React.useState<SpacingOptions>({
    axis: 'x',
    spacing: 20,
    mode: 'move',
  });

  const updateAxis = (axis: string): void => {
    if (axis === 'x' || axis === 'y') setOpts({ ...opts, axis });
  };
  const updateSpacing = (value: string): void => {
    setOpts({ ...opts, spacing: Number(value) });
  };
  const updateMode = (mode: string): void => {
    if (mode === 'move' || mode === 'grow') setOpts({ ...opts, mode });
  };

  const apply = async (): Promise<void> => {
    await applySpacingLayout(opts);
  };

  return (
    <div>
      <SegmentedControl
        value={opts.axis}
        onChange={updateAxis}
        options={[
          { label: 'Horizontal', value: 'x' },
          { label: 'Vertical', value: 'y' },
        ]}
      />
      <SegmentedControl
        value={opts.mode ?? 'move'}
        onChange={updateMode}
        options={[
          { label: 'Move', value: 'move' },
          { label: 'Expand', value: 'grow' },
        ]}
      />
      <InputLabel>
        Spacing
        <Input
          type='number'
          value={String(opts.spacing)}
          onChange={updateSpacing}
          placeholder='Distance'
        />
      </InputLabel>
      <div className='buttons'>
        <Button onClick={apply} variant='primary'>
          <React.Fragment key='.0'>
            <Icon name='arrow-right' />
            <Text>Distribute</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};
export const spacingTabDef: TabTuple = [
  5,
  'spacing',
  'Spacing',
  'Distribute items evenly',
  SpacingTab,
];
