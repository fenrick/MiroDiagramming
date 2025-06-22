import React from 'react';
import {
  Button,
  Icon,
  Input,
  Text,
  InputLabel,
  Paragraph,
  tokens,
} from 'mirotone-react';
import { colors } from '@mirohq/design-tokens';
import { resolveColor } from '../../core/utils/color-utils';
import {
  applyStyleToSelection,
  StyleOptions,
  getFillColorFromSelection,
  tweakFillColor,
} from '../../board/style-tools';
import { useSelection } from '../hooks/useSelection';

/** UI for the Style tab. */
export const StyleTab: React.FC = () => {
  const selection = useSelection();
  const [opts, setOpts] = React.useState<StyleOptions>(() => ({
    fillColor: resolveColor(tokens.color.white, colors.white),
    fontColor: resolveColor(tokens.color.primaryText, colors['gray-700']),
    borderColor: resolveColor(tokens.color.primaryText, colors['gray-700']),
    borderWidth: 1,
    fontSize: 12,
  }));
  const [adjust, setAdjust] = React.useState(0);
  const [currentFill, setCurrentFill] = React.useState<string | null>(null);
  const [styleClipboard, setStyleClipboard] =
    React.useState<StyleOptions | null>(null);

  const update =
    (key: keyof StyleOptions) =>
    (value: string): void => {
      setOpts({
        ...opts,
        [key]:
          key === 'borderWidth' || key === 'fontSize' ? Number(value) : value,
      });
    };

  const apply = async (): Promise<void> => {
    const target = styleClipboard ?? opts;
    await applyStyleToSelection(target);
    setAdjust(0);
    await copyColor();
  };

  const copyColor = async (): Promise<void> => {
    const color = await getFillColorFromSelection();
    if (color) {
      const hex = resolveColor(color, color);
      setCurrentFill(hex);
      setOpts({ ...opts, fillColor: hex });
    }
  };

  const copyStyle = (): void => {
    setStyleClipboard({ ...opts });
  };

  const applyAdjust = async (): Promise<void> => {
    await tweakFillColor(adjust / 100);
    await copyColor();
  };

  React.useEffect(() => {
    void copyColor();
  }, [selection]);

  return (
    <div>
      <InputLabel>
        Fill color
        <Input
          type='color'
          value={opts.fillColor}
          onChange={update('fillColor')}
          placeholder='Fill color'
        />
      </InputLabel>
      <InputLabel>
        Font color
        <Input
          type='color'
          value={opts.fontColor}
          onChange={update('fontColor')}
          placeholder='Font color'
        />
      </InputLabel>
      <InputLabel>
        Border color
        <Input
          type='color'
          value={opts.borderColor}
          onChange={update('borderColor')}
          placeholder='Border color'
        />
      </InputLabel>
      <InputLabel>
        Border width
        <Input
          type='number'
          value={String(opts.borderWidth)}
          onChange={update('borderWidth')}
          placeholder='Border width'
        />
      </InputLabel>
      <InputLabel>
        Font size
        <Input
          type='number'
          value={String(opts.fontSize)}
          onChange={update('fontSize')}
          placeholder='Font size'
        />
      </InputLabel>
      <InputLabel>
        Adjust fill
        <input
          type='range'
          min='-50'
          max='50'
          value={adjust}
          onChange={e => setAdjust(Number(e.target.value))}
          onKeyDown={e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setAdjust(a =>
                Math.min(50, Math.max(-50, a + (e.key === 'ArrowUp' ? 1 : -1))),
              );
            }
          }}
        />
      </InputLabel>
      <Button onClick={applyAdjust} variant='secondary'>
        <React.Fragment key='.0'>
          <Icon name='parameters' />
          <Text>Adjust</Text>
        </React.Fragment>
      </Button>
      {currentFill && (
        <Paragraph data-testid='current-fill'>
          Current fill: {currentFill}
        </Paragraph>
      )}
      <div className='buttons'>
        <Button onClick={copyStyle} variant='secondary'>
          <React.Fragment key='.0'>
            <Icon name='duplicate' />
            <Text>Copy Style</Text>
          </React.Fragment>
        </Button>
        <Button onClick={apply} variant='primary'>
          <React.Fragment key='.0'>
            <Icon name='arrow-right' />
            <Text>Apply Style</Text>
          </React.Fragment>
        </Button>
        <Button onClick={copyColor} variant='secondary'>
          <React.Fragment key='.0'>
            <Icon name='duplicate' />
            <Text>Copy Fill</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};
