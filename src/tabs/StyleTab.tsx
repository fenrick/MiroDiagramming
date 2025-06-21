import React from 'react';
import {
  Button,
  Icon,
  Input,
  Text,
  InputLabel,
  Paragraph,
} from 'mirotone-react';
import {
  applyStyleToSelection,
  StyleOptions,
  getFillColorFromSelection,
  tweakFillColor,
} from '../style-tools';
import { useSelection } from '../useSelection';

/** UI for the Style tab. */
export const StyleTab: React.FC = () => {
  const selection = useSelection();
  const [opts, setOpts] = React.useState<StyleOptions>({
    fillColor: '#ffffff',
    fontColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    borderWidth: 1,
    fontSize: 12,
  });
  const [adjust, setAdjust] = React.useState(0);
  const [currentFill, setCurrentFill] = React.useState<string | null>(null);

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
    await applyStyleToSelection(opts);
    setAdjust(0);
    await copyColor();
  };

  const copyColor = async (): Promise<void> => {
    const color = await getFillColorFromSelection();
    if (color) {
      setCurrentFill(color);
      setOpts({ ...opts, fillColor: color });
    }
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
          value={opts.fillColor}
          onChange={update('fillColor')}
          placeholder='Fill color'
        />
      </InputLabel>
      <InputLabel>
        Font color
        <Input
          value={opts.fontColor}
          onChange={update('fontColor')}
          placeholder='Font color'
        />
      </InputLabel>
      <InputLabel>
        Border color
        <Input
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
  );
};
