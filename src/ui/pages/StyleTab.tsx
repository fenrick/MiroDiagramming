import React from 'react';
import { Button, InputField } from '../components';
import { tweakFillColor, extractFillColor } from '../../board/style-tools';
import { applyStylePreset, presetStyle } from '../../board/format-tools';
import { STYLE_PRESET_NAMES, stylePresets } from '../style-presets';
import { adjustColor } from '../../core/utils/color-utils';
import { useSelection } from '../hooks/use-selection';
import { tokens } from '../tokens';
import { TabPanel } from '../components/TabPanel';
import { TabGrid } from '../components/TabGrid';
import type { TabTuple } from './tab-definitions';
import { Heading, IconSlidersX, Text } from '@mirohq/design-system';

/** Adjusts the fill colour of selected widgets. */
export const StyleTab: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0);
  const selection = useSelection();
  const [baseColor, setBaseColor] = React.useState('#808080');
  // Update base colour when the selection changes
  React.useEffect(() => {
    setBaseColor(extractFillColor(selection[0]) ?? '#808080');
  }, [selection]);
  // Preview colour updated live as the user tweaks the slider
  const preview = React.useMemo(
    () => adjustColor(baseColor, adjust / 100),
    [baseColor, adjust],
  );
  const apply = async (): Promise<void> => {
    await tweakFillColor(adjust / 100);
  };
  return (
    <TabPanel tabId='style'>
      <TabGrid columns={2}>
        <InputField label='Adjust fill'>
          <input
            data-testid='adjust-slider'
            type='range'
            min='-100'
            max='100'
            list='adjust-marks'
            value={adjust}
            onChange={(e) => setAdjust(Number(e.target.value))}
          />
          <datalist id='adjust-marks'>
            {[-100, -50, 0, 50, 100].map((n) => (
              <option
                key={n}
                value={n}
              />
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
          <code
            data-testid='color-hex'
            style={{ marginLeft: tokens.space.xxsmall }}>
            {preview}
          </code>
        </InputField>
        <InputField label='Adjust value'>
          <input
            className='input input-small'
            data-testid='adjust-input'
            type='number'
            min='-100'
            max='100'
            value={String(adjust)}
            onChange={(e) => setAdjust(Number(e.target.value))}
            placeholder='Adjust (-100–100)'
          />
        </InputField>
        <div className='buttons'>
          <Button
            onClick={apply}
            type='button'
            variant='primary'
            icon={<IconSlidersX />}
            iconPosition='start'>
            <Text>Apply</Text>
          </Button>
        </div>
        <Heading level={2}>Style presets</Heading>
        <div className='buttons'>
          {STYLE_PRESET_NAMES.map((name) => {
            const preset = stylePresets[name];
            const style = presetStyle(preset);
            return (
              <Button
                key={name}
                onClick={() => applyStylePreset(preset)}
                type='button'
                variant='secondary'>
                <span
                  style={{
                    color: style.color,
                    backgroundColor: style.fillColor,
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth,
                    borderStyle: 'solid',
                    display: 'inline-block',
                    padding: '0 4px',
                  }}>
                  {preset.label}
                </span>
              </Button>
            );
          })}
        </div>
      </TabGrid>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  3,
  'style',
  'Colours',
  'Lighten or darken the fill colour of selected shapes',
  StyleTab,
];
