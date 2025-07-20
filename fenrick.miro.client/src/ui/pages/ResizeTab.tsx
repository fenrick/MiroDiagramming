import {
  Grid,
  Heading,
  IconArrowArcLeft,
  IconChevronRightDouble,
  IconSquaresTwoOverlap,
  Text,
} from '@mirohq/design-system';
import React from 'react';
import {
  applySizeToSelection,
  copySizeFromSelection,
  scaleSelection,
  Size,
} from '../../board/resize-tools';
import {
  ASPECT_RATIOS,
  AspectRatioId,
  aspectRatioValue,
  ratioHeight,
} from '../../core/utils/aspect-ratio';
import {
  boardUnitsToInches,
  boardUnitsToMm,
} from '../../core/utils/unit-utils';
import {
  Button,
  InputField,
  Paragraph,
  SelectField,
  SelectOption,
} from '../components';
import { PageHelp } from '../components/PageHelp';
import { TabPanel } from '../components/TabPanel';
import { useSelection } from '../hooks/use-selection';
import type { TabTuple } from './tab-definitions';

/** Predefined button sizes used by the quick presets. */
const PRESET_SIZES: Record<'S' | 'M' | 'L', Size> = {
  S: { width: 100, height: 100 },
  M: { width: 200, height: 150 },
  L: { width: 400, height: 300 },
};

/** Scale options for quick resizing by factors. */
const SCALE_OPTIONS = [
  { label: '×½', factor: 0.5 },
  { label: '×2', factor: 2 },
  { label: '×3', factor: 3 },
] as const;

/** UI for the Resize tab. */
export const ResizeTab: React.FC = () => {
  const selection = useSelection();
  const [size, setSize] = React.useState<Size>({ width: 100, height: 100 });
  const [copiedSize, setCopiedSize] = React.useState<Size | null>(null);
  const [warning, setWarning] = React.useState('');
  const [ratio, setRatio] = React.useState<AspectRatioId | 'none'>('none');

  const update =
    (key: keyof Size) =>
    (value: string): void => {
      setSize({ ...size, [key]: Number(value) });
      setWarning('');
    };

  const copy = React.useCallback(async (): Promise<void> => {
    const s = await copySizeFromSelection();
    if (s) {
      setSize(s);
      setCopiedSize(s);
    }
  }, []);

  const resetCopy = (): void => setCopiedSize(null);

  const apply = React.useCallback(async (): Promise<void> => {
    const target = copiedSize ?? size;
    if (target.width > 10000 || target.height > 10000) {
      setWarning("That's bigger than your board viewport");
      return;
    }
    await applySizeToSelection(target);
  }, [copiedSize, size]);

  const scale = React.useCallback(async (factor: number): Promise<void> => {
    await scaleSelection(factor);
    const updated = await copySizeFromSelection();
    if (updated) {
      setSize(updated);
    }
  }, []);

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
    if (ratio === 'none') {
      return;
    }
    setSize(prev => {
      const h = ratioHeight(prev.width, aspectRatioValue(ratio));
      return prev.height === h ? prev : { ...prev, height: h };
    });
  }, [ratio, size.width]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copy();
      } else if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        apply();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [copy, apply]);

  return (
    <TabPanel tabId='size'>
      <PageHelp content='Adjust size manually or copy from selection' />
      <Paragraph data-testid='size-display'>
        {copiedSize
          ? `Copied: ${copiedSize.width}×${copiedSize.height}`
          : `Selection: ${size.width}×${size.height}`}
        <br />
        {boardUnitsToMm(size.width).toFixed(1)} mm ×{' '}
        {boardUnitsToMm(size.height).toFixed(1)} mm (
        {boardUnitsToInches(size.width).toFixed(2)} ×{' '}
        {boardUnitsToInches(size.height).toFixed(2)} in)
      </Paragraph>
      {warning && <p className='error'>{warning}</p>}
      <Grid
        columns={2}
        gap={200}>
        <Grid.Item
          columnStart={1}
          columnEnd={2}>
          <InputField
            label='Width:'
            type='number'
            value={String(size.width)}
            onValueChange={v => update('width')(v)}
            placeholder='Width (board units)'
          />
        </Grid.Item>
        <Grid.Item
          columnStart={2}
          columnEnd={3}>
          <InputField
            label='Height:'
            type='number'
            value={String(size.height)}
            onValueChange={v => update('height')(v)}
            placeholder='Height (board units)'
          />
        </Grid.Item>
        <Grid.Item
          columnStart={1}
          columnEnd={5}>
          <SelectField
            label='Aspect Ratio'
            value={ratio}
            onChange={v => setRatio(v as AspectRatioId | 'none')}
            data-testid='ratio-select'>
            <SelectOption value='none'>Free</SelectOption>
            {ASPECT_RATIOS.map(r => (
              <SelectOption
                key={r.id}
                value={r.id}>
                {r.label}
              </SelectOption>
            ))}
          </SelectField>
        </Grid.Item>
      </Grid>
      <Heading level={3}>Presets</Heading>
      <Grid columns={1}>
        <Grid.Item>
          <div>
            {(['S', 'M', 'L'] as const).map(p => (
              <Button
                key={p}
                onClick={() => setSize(PRESET_SIZES[p])}
                variant='secondary'>
                {p}
              </Button>
            ))}
            <br />
            {SCALE_OPTIONS.map(s => (
              <Button
                key={s.label}
                onClick={() => scale(s.factor)}
                variant='secondary'>
                {s.label}
              </Button>
            ))}
          </div>
        </Grid.Item>
      </Grid>
      <div className='buttons'>
        <Button
          onClick={apply}
          variant='primary'
          iconPosition='start'
          icon={<IconChevronRightDouble />}>
          <Text>Apply Size</Text>
        </Button>
        <Button
          onClick={copiedSize ? resetCopy : copy}
          variant='secondary'
          iconPosition='start'
          icon={copiedSize ? <IconArrowArcLeft /> : <IconSquaresTwoOverlap />}>
          <Text>{copiedSize ? 'Reset Copy' : 'Copy Size'}</Text>
        </Button>
      </div>
    </TabPanel>
  );
};
export const tabDef: TabTuple = [
  2,
  'size',
  'Size',
  'Adjust size manually or copy from selection',
  ResizeTab,
];
