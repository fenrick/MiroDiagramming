import React from 'react';
import { Button, Input } from 'mirotone-react';
import {
  applySizeToSelection,
  copySizeFromSelection,
  Size,
} from '../resize-tools';
import { boardUnitsToMm, boardUnitsToInches } from '../unit-utils';

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const [size, setSize] = React.useState<Size>({ width: 100, height: 100 });
  const [copied, setCopied] = React.useState(false);

  const update =
    (key: keyof Size) =>
    (value: string): void => {
      setSize({ ...size, [key]: Number(value) });
    };

  const copy = async (): Promise<void> => {
    const s = await copySizeFromSelection();
    if (s) {
      setSize(s);
      setCopied(true);
    }
  };

  const apply = async (): Promise<void> => {
    await applySizeToSelection(size);
  };

  return (
    <div>
      <p data-testid='size-display'>
        {copied ? `Copied ${size.width}×${size.height}` : 'Manual size'}
      </p>
      <Input
        type='number'
        value={String(size.width)}
        onChange={update('width')}
        placeholder='Width (board units)'
      />
      <Input
        type='number'
        value={String(size.height)}
        onChange={update('height')}
        placeholder='Height (board units)'
      />
      <p>
        {boardUnitsToMm(size.width).toFixed(1)} mm ×{' '}
        {boardUnitsToMm(size.height).toFixed(1)} mm (
        {boardUnitsToInches(size.width).toFixed(2)} ×{' '}
        {boardUnitsToInches(size.height).toFixed(2)} in)
      </p>
      <Button onClick={copy} size='small'>
        Copy Size
      </Button>
      <Button onClick={apply} size='small'>
        Apply Size
      </Button>
    </div>
  );
};
