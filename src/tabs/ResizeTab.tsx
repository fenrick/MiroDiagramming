import React from 'react';
import { Button } from 'mirotone-react';
import {
  applySizeToSelection,
  copySizeFromSelection,
  Size,
} from '../resize-tools';

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const [size, setSize] = React.useState<Size | null>(null);

  const copy = async (): Promise<void> => {
    const s = await copySizeFromSelection();
    setSize(s);
  };

  const apply = async (): Promise<void> => {
    if (size) await applySizeToSelection(size);
  };

  return (
    <div>
      <p data-testid='size-display'>
        {size ? `${size.width}×${size.height}` : 'No size copied'}
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
