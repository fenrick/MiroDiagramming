import {
  Grid,
  IconArrowArcLeft,
  IconChevronRightDouble,
  IconSquaresTwoOverlap,
  Text,
} from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import {
  applySizeToSelection,
  copySizeFromSelection,
  scaleSelection,
  type Size,
} from '../../board/resize-tools'
import {
  ASPECT_RATIOS,
  type AspectRatioId,
  aspectRatioValue,
  ratioHeight,
} from '../../core/utils/aspect-ratio'
import { boardUnitsToInches, boardUnitsToMm } from '../../core/utils/unit-utilities'
import {
  Button,
  ButtonToolbar,
  EmptyState,
  InputField,
  Paragraph,
  SelectField,
  SelectOption,
  SidebarSection,
} from '../components'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { useSelection } from '../hooks/use-selection'
import { StickyActions } from '../sticky-actions'

import type { TabTuple } from './tab-definitions'

type PresetKey = 'S' | 'M' | 'L'

const PRESET_SIZES: ReadonlyMap<PresetKey, Size> = new Map<PresetKey, Size>([
  ['S', { width: 100, height: 100 }],
  ['M', { width: 200, height: 150 }],
  ['L', { width: 400, height: 300 }],
])

const SCALE_OPTIONS = [
  { label: '×½', factor: 0.5 },
  { label: '×2', factor: 2 },
  { label: '×3', factor: 3 },
] as const

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

const formatSelectionSummary = (count: number): string => {
  if (count <= 0) {
    return 'No selection'
  }
  const suffix = count === 1 ? 'item' : 'items'
  return `${count.toLocaleString()} ${suffix} selected`
}

const formatDimension = (value: number): string => value.toLocaleString()

export const ResizeTab: React.FC = () => {
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const selectionSummary = formatSelectionSummary(selection.length)
  const [size, setSize] = React.useState<Size>({ width: 100, height: 100 })
  const [copiedSize, setCopiedSize] = React.useState<Size | null>(null)
  const [warning, setWarning] = React.useState('')
  const [ratio, setRatio] = React.useState<AspectRatioId | 'none'>('none')

  const update =
    (key: keyof Size) =>
    (value: string): void => {
      const numeric = Number(value)
      setSize((current) => {
        if (key === 'width') {
          return { ...current, width: numeric }
        }
        return { ...current, height: numeric }
      })
      setWarning('')
    }

  const copy = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    const s = await copySizeFromSelection()
    if (s) {
      setSize(s)
      setCopiedSize(s)
    }
  }, [hasSelection])

  const resetCopy = (): void => {
    setCopiedSize(null)
  }

  const apply = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    const target = copiedSize ?? size
    if (target.width > 10_000 || target.height > 10_000) {
      setWarning("That's bigger than your board viewport")
      return
    }
    await applySizeToSelection(target)
  }, [copiedSize, size, hasSelection])

  const scale = React.useCallback(
    async (factor: number): Promise<void> => {
      if (!hasSelection) {
        return
      }
      await scaleSelection(factor)
      const updated = await copySizeFromSelection()
      if (updated) {
        setSize(updated)
      }
    },
    [hasSelection],
  )

  const applyPreset = React.useCallback(
    (key: PresetKey): void => {
      if (!hasSelection) {
        return
      }
      const preset = PRESET_SIZES.get(key)
      if (!preset) {
        return
      }
      const target = { ...preset }
      setCopiedSize(null)
      setSize(target)
      void applySizeToSelection(target)
    },
    [hasSelection],
  )

  React.useEffect(() => {
    if (copiedSize) {
      return
    }
    const first = selection[0] as { width?: number; height?: number } | undefined
    if (first && typeof first.width === 'number' && typeof first.height === 'number') {
      setSize({ width: first.width, height: first.height })
    }
    setWarning('')
    setRatio('none')
  }, [selection, copiedSize])

  React.useEffect(() => {
    if (ratio === 'none') {
      return
    }
    setSize((previous) => {
      const heightCalculated = ratioHeight(previous.width, aspectRatioValue(ratio))
      return previous.height === heightCalculated
        ? previous
        : { ...previous, height: heightCalculated }
    })
  }, [ratio, size.width])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void copy()
      } else if (event.altKey && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        void apply()
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => {
      globalThis.removeEventListener('keydown', handler)
    }
  }, [copy, apply])

  return (
    <TabPanel tabId="size">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Adjust size manually or copy from selection" />
        {copiedSize ? (
          <SidebarSection title="Copy mode">
            <Paragraph>
              Using copied size {formatDimension(copiedSize.width)}×
              {formatDimension(copiedSize.height)}. Clear to resume syncing with selection.
            </Paragraph>
          </SidebarSection>
        ) : null}
        {hasSelection ? null : (
          <EmptyState title="No selection" description="Select one or more items to resize." />
        )}
        <Paragraph data-testid="size-display">
          {copiedSize ? (
            <>
              Copied: {formatDimension(copiedSize.width)}×{formatDimension(copiedSize.height)}
            </>
          ) : (
            <>
              Selection: {formatDimension(size.width)}×{formatDimension(size.height)}
            </>
          )}
          <br />
          {boardUnitsToMm(size.width).toFixed(1)} mm × {boardUnitsToMm(size.height).toFixed(1)} mm (
          {boardUnitsToInches(size.width).toFixed(2)} × {boardUnitsToInches(size.height).toFixed(2)}{' '}
          in)
          <br />
          {hasSelection ? selectionSummary : 'No selection'}
        </Paragraph>
        {warning && <p className="error">{warning}</p>}
        <SidebarSection title="Manual size">
          <Grid columns={2} gap={200}>
            <Grid.Item columnStart={1} columnEnd={2}>
              <InputField
                label="Width:"
                type="number"
                value={String(size.width)}
                onValueChange={(v) => {
                  update('width')(v)
                }}
                placeholder="Width (board units)"
              />
            </Grid.Item>
            <Grid.Item columnStart={2} columnEnd={3}>
              <InputField
                label="Height:"
                type="number"
                value={String(size.height)}
                onValueChange={(v) => {
                  update('height')(v)
                }}
                placeholder="Height (board units)"
              />
            </Grid.Item>
            <Grid.Item columnStart={1} columnEnd={5}>
              <SelectField
                label="Aspect Ratio"
                value={ratio}
                onChange={(v) => {
                  setRatio(v as AspectRatioId | 'none')
                }}
                data-testid="ratio-select"
              >
                <SelectOption value="none">Free</SelectOption>
                {ASPECT_RATIOS.map((r) => (
                  <SelectOption key={r.id} value={r.id}>
                    {r.label}
                  </SelectOption>
                ))}
              </SelectField>
            </Grid.Item>
          </Grid>
        </SidebarSection>
        <SidebarSection title="Presets">
          <Grid columns={1}>
            <Grid.Item>
              <div>
                {(['S', 'M', 'L'] as const).map((p) => (
                  <Button
                    key={p}
                    onClick={() => {
                      applyPreset(p)
                    }}
                    variant="secondary"
                    disabled={!hasSelection}
                  >
                    {p}
                  </Button>
                ))}
                <br />
                {SCALE_OPTIONS.map((s) => (
                  <Button
                    key={s.label}
                    onClick={() => {
                      void scale(s.factor)
                    }}
                    variant="secondary"
                    disabled={!hasSelection}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </Grid.Item>
          </Grid>
        </SidebarSection>
        <StickyActions>
          <ButtonToolbar>
            <Button
              onClick={() => {
                void apply()
              }}
              variant="primary"
              iconPosition="start"
              icon={<IconChevronRightDouble />}
              disabled={!hasSelection}
            >
              <Text>Apply Size</Text>
            </Button>
            <Button
              onClick={() => {
                if (copiedSize) {
                  resetCopy()
                  return
                }
                void copy()
              }}
              variant={copiedSize ? 'danger' : 'secondary'}
              iconPosition="start"
              icon={copiedSize ? <IconArrowArcLeft /> : <IconSquaresTwoOverlap />}
              disabled={!copiedSize && !hasSelection}
            >
              <Text>{copiedSize ? 'Clear Copy Mode' : 'Copy Size'}</Text>
            </Button>
          </ButtonToolbar>
        </StickyActions>
      </div>
    </TabPanel>
  )
}
export const tabDefinition: TabTuple = [
  2,
  'size',
  'Size',
  'Adjust size manually or copy from selection',
  ResizeTab,
]
