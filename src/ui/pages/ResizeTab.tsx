import React from 'react';
import {
  Button,
  FormGroup,
  InputField,
  Paragraph,
  Icon,
  Text,
} from '../components/legacy';
import {
  applySizeToSelection,
  copySizeFromSelection,
  Size,
} from '../../board/resize-tools';
import { useSelection } from '../hooks/use-selection';
import type { TabTuple } from './tab-definitions';
import {
  boardUnitsToMm,
  boardUnitsToInches,
} from '../../core/utils/unit-utils';

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const selection = useSelection();
  const [size, setSize] = React.useState<Size>({ width: 100, height: 100 });
  const [copiedSize, setCopiedSize] = React.useState<Size | null>(null);
  const [warning, setWarning] = React.useState('');

  const update =
    (key: keyof Size) =>
    (value: string): void => {
      setSize({ ...size, [key]: Number(value) });
      setWarning('');
    };

  const copy = async (): Promise<void> => {
    const s = await copySizeFromSelection();
    if (s) {
      setSize(s);
      setCopiedSize(s);
    }
  };

  const resetCopy = (): void => {
    setCopiedSize(null);
  };

  const apply = async (): Promise<void> => {
    const target = copiedSize ?? size;
    if (target.width > 10000 || target.height > 10000) {
      setWarning("That's bigger than your board viewport");
      return;
    }
    await applySizeToSelection(target);
  };

  React.useEffect(() => {
    const first = selection[0] as
      | { width?: number; height?: number }
      | undefined;
    if (
      first &&
      typeof first.width === 'number' &&
      typeof first.height === 'number'
    ) {
      setSize({ width: first.width, height: first.height });
    }
  }, [selection]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        void copy();
      } else if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        void apply();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className='custom-centered'>
      <Paragraph data-testid='size-display'>
        {copiedSize
          ? `Copied: ${copiedSize.width}×${copiedSize.height}`
          : `Selection: ${size.width}×${size.height}`}
      </Paragraph>
      {warning && <Paragraph className='error'>{warning}</Paragraph>}
      <FormGroup>
        <InputField label='Width:'>
          <input
            className='input input-small'
            type='number'
            value={String(size.width)}
            onChange={(e) => update('width')(e.target.value)}
            placeholder='Width (board units)'
          />
        </InputField>
        <InputField label='Height:'>
          <input
            className='input input-small'
            type='number'
            value={String(size.height)}
            onChange={(e) => update('height')(e.target.value)}
            placeholder='Height (board units)'
          />
        </InputField>
      </FormGroup>
      <div>
        {['S', 'M', 'L'].map((p) => (
          <Button
            key={p}
            onClick={() =>
              setSize(
                p === 'S'
                  ? { width: 100, height: 100 }
                  : p === 'M'
                    ? { width: 200, height: 150 }
                    : { width: 400, height: 300 },
              )
            }
            variant='secondary'>
            {p}
          </Button>
        ))}
      </div>
      <Paragraph>
        {boardUnitsToMm(size.width).toFixed(1)} mm ×{' '}
        {boardUnitsToMm(size.height).toFixed(1)} mm (
        {boardUnitsToInches(size.width).toFixed(2)} ×{' '}
        {boardUnitsToInches(size.height).toFixed(2)} in)
      </Paragraph>
      <div className='buttons'>
        <Button
          onClick={copiedSize ? resetCopy : copy}
          variant='secondary'>
          <React.Fragment key='.0'>
            <Icon name={copiedSize ? 'undo' : 'duplicate'} />
            <Text>{copiedSize ? 'Reset Copy' : 'Copy Size'}</Text>
          </React.Fragment>
        </Button>
        <Button
          onClick={apply}
          variant='primary'>
          <React.Fragment key='.0'>
            <Icon name='arrow-right' />
            <Text>Apply Size</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};
export const tabDef: TabTuple = [
  2,
  'resize',
  'Resize',
  'Adjust size manually or copy from selection',
  ResizeTab,
];
