import React from 'react';
import { Button, Input } from 'mirotone-react';
import {
  applyStyleToSelection,
  StyleOptions,
  getFillColorFromSelection,
  tweakFillColor,
} from '../style-tools';
import { ensureContrast } from '../color-utils';
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
      <Input
        value={opts.fillColor}
        onChange={update('fillColor')}
        placeholder='Fill color'
        style={{
          backgroundColor: opts.fillColor,
          color: ensureContrast(opts.fillColor ?? '#ffffff', '#ffffff'),
        }}
      />
      <Input
        value={opts.fontColor}
        onChange={update('fontColor')}
        placeholder='Font color'
      />
      <Input
        value={opts.borderColor}
        onChange={update('borderColor')}
        placeholder='Border color'
      />
      <Input
        type='number'
        value={String(opts.borderWidth)}
        onChange={update('borderWidth')}
        placeholder='Border width'
      />
      <Input
        type='number'
        value={String(opts.fontSize)}
        onChange={update('fontSize')}
        placeholder='Font size'
      />
      <div style={{ marginTop: 8 }}>
        <input
          type='range'
          min='-50'
          max='50'
          value={adjust}
          onChange={e => setAdjust(Number(e.target.value))}
        />
        <Button onClick={applyAdjust} size='small'>
          Adjust
        </Button>
      </div>
      {currentFill && (
        <p
          data-testid='current-fill'
          style={{
            backgroundColor: currentFill,
            color: ensureContrast(currentFill, '#ffffff'),
            padding: 4,
          }}
        >
          Current fill: {currentFill}
        </p>
      )}
      <Button onClick={apply} size='small'>
        Apply Style
      </Button>
      <Button onClick={copyColor} size='small'>
        Copy Fill
      </Button>
    </div>
  );
};
