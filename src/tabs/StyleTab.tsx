import React from 'react';
import { Button, Input } from 'mirotone-react';
import { applyStyleToSelection, StyleOptions } from '../style-tools';

/** UI for the Style tab. */
export const StyleTab: React.FC = () => {
  const [opts, setOpts] = React.useState<StyleOptions>({
    fillColor: '#ffffff',
    fontColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    borderWidth: 1,
    fontSize: 12,
  });

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
  };

  return (
    <div>
      <Input
        value={opts.fillColor}
        onChange={update('fillColor')}
        placeholder='Fill color'
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
      <Button onClick={apply} size='small'>
        Apply Style
      </Button>
    </div>
  );
};
