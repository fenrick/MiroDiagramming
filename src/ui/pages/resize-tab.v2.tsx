import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Input } from '@base-ui-components/react/input'

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
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'

const PRESET_SIZES: ReadonlyMap<'S' | 'M' | 'L', Size> = new Map([
  ['S', { width: 100, height: 100 }],
  ['M', { width: 200, height: 150 }],
  ['L', { width: 400, height: 300 }],
])

const SCALE_OPTIONS = [
  { label: '×½', factor: 0.5 },
  { label: '×2', factor: 2 },
  { label: '×3', factor: 3 },
] as const

export const ResizeTabV2: React.FC = () => {
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const [size, setSize] = React.useState<Size>({ width: 100, height: 100 })
  const [copiedSize, setCopiedSize] = React.useState<Size | null>(null)
  const [warning, setWarning] = React.useState('')
  const [ratio, setRatio] = React.useState<AspectRatioId | 'none'>('none')

  const update =
    (key: keyof Size) =>
    (value: string | number): void => {
      const numeric = typeof value === 'number' ? value : Number(value)
      setSize((current) => ({ ...current, [key]: numeric }))
      setWarning('')
    }

  const copy = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) return
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
    if (!hasSelection) return
    const target = copiedSize ?? size
    if (target.width > 10_000 || target.height > 10_000) {
      setWarning("That's bigger than your board viewport")
      return
    }
    await applySizeToSelection(target)
  }, [copiedSize, size, hasSelection])

  const scale = React.useCallback(
    async (factor: number): Promise<void> => {
      if (!hasSelection) return
      await scaleSelection(factor)
      const updated = await copySizeFromSelection()
      if (updated) setSize(updated)
    },
    [hasSelection],
  )

  const applyPreset = React.useCallback(
    (key: 'S' | 'M' | 'L'): void => {
      if (!hasSelection) return
      const preset = PRESET_SIZES.get(key)
      if (!preset) return
      const target = { ...preset }
      setCopiedSize(null)
      setSize(target)
      void applySizeToSelection(target)
    },
    [hasSelection],
  )

  React.useEffect(() => {
    if (copiedSize) return
    const first = selection[0] as { width?: number; height?: number } | undefined
    if (first && typeof first.width === 'number' && typeof first.height === 'number') {
      setSize({ width: first.width, height: first.height })
    }
    setWarning('')
    setRatio('none')
  }, [selection, copiedSize])

  React.useEffect(() => {
    if (ratio === 'none') return
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
      <div className="stack-md">
        <PageHelp content="Adjust size manually or copy from selection" />
        {copiedSize ? (
          <section title="Copy mode">
            <p>
              Using copied size {copiedSize.width}×{copiedSize.height}. Clear to resume syncing with
              selection.
            </p>
          </section>
        ) : null}

        {!hasSelection && (
          <p style={{ color: 'var(--colors-gray-700)' }}>
            No selection. Choose widgets to apply sizing tools.
          </p>
        )}

        <section className="stack-sm" title="Manual size">
          <div className="stack-2xs">
            <span className="label">Width</span>
            <Input
              className="input"
              type="number"
              value={size.width}
              onValueChange={(value) => {
                update('width')(value)
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Height</span>
            <Input
              className="input"
              type="number"
              value={size.height}
              onValueChange={(value) => {
                update('height')(value)
              }}
            />
          </div>

          <div className="stack-2xs">
            <span className="label">Aspect ratio</span>
            <select
              className="input"
              value={ratio}
              onChange={(event) => {
                setRatio(event.target.value as AspectRatioId | 'none')
              }}
            >
              <option value="none">Free</option>
              {ASPECT_RATIOS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <BaseButton
              className="button button-primary"
              onClick={() => void apply()}
              disabled={!hasSelection}
            >
              Apply size
            </BaseButton>
            <BaseButton
              className="button button-secondary"
              onClick={() => void copy()}
              disabled={!hasSelection}
            >
              Copy from selection (⌥C)
            </BaseButton>
            {copiedSize && (
              <BaseButton className="button button-ghost" onClick={resetCopy}>
                Clear copied size
              </BaseButton>
            )}
          </div>
          {warning && <p className="error">{warning}</p>}
        </section>

        <section className="stack-sm" title="Presets">
          <div className="button-group">
            {[...PRESET_SIZES.keys()].map((key) => (
              <BaseButton
                key={key}
                className="button"
                onClick={() => {
                  applyPreset(key)
                }}
                disabled={!hasSelection}
              >
                {key}
              </BaseButton>
            ))}
          </div>
        </section>

        <section className="stack-sm" title="Scale">
          <div className="button-group">
            {SCALE_OPTIONS.map((option) => (
              <BaseButton
                key={option.label}
                className="button"
                onClick={() => void scale(option.factor)}
                disabled={!hasSelection}
              >
                {option.label}
              </BaseButton>
            ))}
          </div>
        </section>

        <section className="stack-sm" title="Diagnostics">
          <div className="stack-2xs">
            <span className="label">Current size</span>
            <output>
              {size.width} × {size.height}
            </output>
          </div>
          <div className="stack-2xs">
            <span className="label">Inches</span>
            <output>
              {boardUnitsToInches(size.width).toFixed(2)} ×{' '}
              {boardUnitsToInches(size.height).toFixed(2)}
            </output>
          </div>
          <div className="stack-2xs">
            <span className="label">Millimeters</span>
            <output>
              {boardUnitsToMm(size.width).toFixed(1)} × {boardUnitsToMm(size.height).toFixed(1)}
            </output>
          </div>
        </section>

        <StickyActions>
          <div className="button-group">
            <BaseButton
              className="button button-primary"
              onClick={() => void apply()}
              disabled={!hasSelection}
            >
              Apply size
            </BaseButton>
          </div>
        </StickyActions>
      </div>
    </TabPanel>
  )
}

export default ResizeTabV2
