import React from 'react';
import {
  Button,
  Input,
  FormGroup,
  InputLabel,
  Paragraph,
  Icon,
  Text,
  Heading,
} from 'mirotone-react';
import {
  applySizeToSelection,
  copySizeFromSelection,
  Size,
} from '../../resize-tools';
import { useSelection } from '../useSelection';
import { boardUnitsToMm, boardUnitsToInches } from '../../unit-utils';

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const selection = useSelection();
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
      setCopied(true);
    }
  }, [selection]);

  return (
    <div className='centered'>
      <Heading level={2}>Resize Shapes</Heading>
      <Paragraph data-testid='size-display'>
        {copied ? `Copied ${size.width}×${size.height}` : 'Manual size'}
      </Paragraph>
      <FormGroup>
        <InputLabel htmlFor='id-width'>Width:</InputLabel>
        <Input
          id='id-width'
          type='number'
          value={String(size.width)}
          onChange={update('width')}
          placeholder='Width (board units)'
        />
        <InputLabel htmlFor='id-height'>Height:</InputLabel>
        <Input
          id='id-height'
          type='number'
          value={String(size.height)}
          onChange={update('height')}
          placeholder='Height (board units)'
        />
      </FormGroup>
      <Paragraph>
        {boardUnitsToMm(size.width).toFixed(1)} mm ×{' '}
        {boardUnitsToMm(size.height).toFixed(1)} mm (
        {boardUnitsToInches(size.width).toFixed(2)} ×{' '}
        {boardUnitsToInches(size.height).toFixed(2)} in)
      </Paragraph>
      <div className='buttons'>
        <Button onClick={copy} variant='secondary'>
          <React.Fragment key='.0'>
            <Icon name='duplicate' />
            <Text>Copy Size</Text>
          </React.Fragment>
        </Button>
        <Button onClick={apply} variant='primary'>
          <React.Fragment key='.0'>
            <Icon name='arrow-right' />
            <Text>Apply Size</Text>
          </React.Fragment>
        </Button>
      </div>
    </div>
  );
};
