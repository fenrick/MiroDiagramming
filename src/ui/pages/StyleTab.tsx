import React from 'react';
import { Button, Icon, Input, Text, InputLabel } from '../components/legacy';
import { tweakFillColor } from '../../board/style-tools';
import { adjustColor } from '../../core/utils/color-utils';
import { tokens } from '../tokens';
import type { TabTuple } from './tab-definitions';

/** Adjusts the fill colour of selected widgets. */
export const StyleTab: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0);
  // Preview colour updated live as the user tweaks the slider
  const preview = React.useMemo(
    () => adjustColor('#808080', adjust / 100),
    [adjust],
  );
  const apply = async (): Promise<void> => {
    await tweakFillColor(adjust / 100);
  };
  return (
    <div>
      <InputLabel>
        Adjust fill
        <input
          data-testid='adjust-slider'
          type='range'
          min='-100'
          max='100'
          list='adjust-marks'
          value={adjust}
          onChange={e => setAdjust(Number(e.target.value))}
        />
        <datalist id='adjust-marks'>
          {[-100, -50, 0, 50, 100].map(n => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <span
          data-testid='adjust-preview'
          style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            marginLeft: tokens.space.small,
            border: `1px solid ${tokens.color.gray[200]}`,
            backgroundColor: preview,
          }}
        />
      </InputLabel>
      <InputLabel>
        Adjust value
        <Input
          data-testid='adjust-input'
          type='number'
          min='-100'
          max='100'
          value={String(adjust)}
          onChange={value => setAdjust(Number(value))}
          placeholder='Adjust (-100–100)'
        />
      </InputLabel>
      <div className='buttons'>
        <Button onClick={apply} variant='primary'>
          <React.Fragment>
            <Icon name='parameters' />
            <Text>Apply</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};

export const tabDef: TabTuple = [
  3,
  'style',
  'Colour Adjust',
  'Lighten or darken the fill colour of selected shapes',
  StyleTab,
];
