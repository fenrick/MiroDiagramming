import React from 'react';
import { Button, InputField } from '../components';
import {
  tweakFillColor,
  tweakOpacity,
  tweakBorderWidth,
  copyFillFromSelection,
  extractFillColor,
} from '../../board/style-tools';
import { applyStylePreset, presetStyle } from '../../board/format-tools';
import { STYLE_PRESET_NAMES, stylePresets } from '../style-presets';
import { adjustColor } from '../../core/utils/color-utils';
import { useSelection } from '../hooks/use-selection';
import { tokens } from '../tokens';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';
import { Grid, Form, Heading, IconSlidersX, Text } from '@mirohq/design-system';

/** Adjusts the fill colour of selected widgets. */
export const StyleTab: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0);
  const selection = useSelection();
  const [baseColor, setBaseColor] = React.useState('#808080');
  const [opacityDelta, setOpacityDelta] = React.useState(0);
  const [borderDelta, setBorderDelta] = React.useState(0);
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
  const applyOpacity = React.useCallback(async (): Promise<void> => {
    await tweakOpacity(opacityDelta);
  }, [opacityDelta]);
  const applyBorder = React.useCallback(async (): Promise<void> => {
    await tweakBorderWidth(borderDelta);
  }, [borderDelta]);
  const copyFill = React.useCallback(async (): Promise<void> => {
    const colour = await copyFillFromSelection();
    if (colour) setBaseColor(colour);
  }, []);
  const sliderId = React.useId();
  return (
    <TabPanel tabId='style'>
      <Grid columns={2}>
        <Grid.Item>
          <Form.Field>
            <Form.Label htmlFor={sliderId}>Adjust fill</Form.Label>
            <input
              id={sliderId}
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
          </Form.Field>
        </Grid.Item>
        <Grid.Item>
          <InputField
            label='Adjust value'
            type='number'
            min={-100}
            max={100}
            value={String(adjust)}
            onValueChange={(v) => setAdjust(Number(v))}
            placeholder='Adjust (-100–100)'
            data-testid='adjust-input'
          />
        </Grid.Item>
        <Grid.Item>
          <InputField
            label='Opacity Δ'
            type='number'
            step='0.1'
            min={-1}
            max={1}
            value={String(opacityDelta)}
            onValueChange={(v) => setOpacityDelta(Number(v))}
            placeholder='Δ opacity (-1–1)'
            data-testid='opacity-input'
          />
        </Grid.Item>
        <Grid.Item>
          <InputField
            label='Border Δ'
            type='number'
            value={String(borderDelta)}
            onValueChange={(v) => setBorderDelta(Number(v))}
            placeholder='Δ width'
            data-testid='border-input'
          />
        </Grid.Item>
        <Grid.Item>
          <div className='buttons'>
            <Button
              onClick={apply}
              type='button'
              variant='primary'
              icon={<IconSlidersX />}
              iconPosition='start'>
              <Text>Apply</Text>
            </Button>
            <Button
              onClick={applyOpacity}
              type='button'
              variant='secondary'>
              <Text>Opacity</Text>
            </Button>
            <Button
              onClick={applyBorder}
              type='button'
              variant='secondary'>
              <Text>Border</Text>
            </Button>
            <Button
              onClick={copyFill}
              type='button'
              variant='ghost'>
              <Text>Copy Fill</Text>
            </Button>
          </div>
        </Grid.Item>
        <Grid.Item>
          <Heading level={2}>Style presets</Heading>
        </Grid.Item>
        <Grid.Item>
          <div className='buttons'>
            {STYLE_PRESET_NAMES.map((name) => {
              const preset = stylePresets[name];
              const style = presetStyle(preset);
              return (
                <Button
                  key={name}
                  onClick={() => applyStylePreset(preset)}
                  type='button'
                  variant='secondary'
                  css={{
                    color: style.color,
                    backgroundColor: style.fillColor,
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth,
                    borderStyle: 'solid',
                    display: 'inline-block',
                    padding: '0 4px',
                  }}>
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </Grid.Item>
      </Grid>
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
