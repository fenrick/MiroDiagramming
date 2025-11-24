import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Input } from '@base-ui-components/react/input'
import { Slider } from '../primitives'

import { adjustColor } from '../../core/utils/color-utilities'
import { applyStylePreset, presetStyle } from '../../board/format-tools'
import {
  copyFillFromSelection,
  extractFillColor,
  tweakBorderWidth,
  tweakFillColor,
  tweakOpacity,
} from '../../board/style-tools'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { InfoCallout } from '../components/info-callout'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'
import { STYLE_PRESET_NAMES, stylePresets } from '../style-presets'

const swatch = {
  display: 'inline-block',
  width: 'var(--size-thumb)',
  height: 'var(--size-thumb)',
  borderRadius: 'var(--radius-200)',
  border: '1px solid var(--colors-gray-200)',
}

const presetKeys = STYLE_PRESET_NAMES

export const StyleTabV2: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0)
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const [baseColor, setBaseColor] = React.useState('#808080')
  const [opacityDelta, setOpacityDelta] = React.useState(0)
  const [borderDelta, setBorderDelta] = React.useState(0)

  React.useEffect(() => {
    setBaseColor(extractFillColor(selection[0]) ?? '#808080')
  }, [selection])

  const preview = React.useMemo(() => adjustColor(baseColor, adjust / 100), [baseColor, adjust])

  const apply = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) return
    await tweakFillColor(adjust / 100)
  }, [adjust, hasSelection])

  const applyOpacity = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) return
    await tweakOpacity(opacityDelta)
  }, [opacityDelta, hasSelection])

  const applyBorder = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) return
    await tweakBorderWidth(borderDelta)
  }, [borderDelta, hasSelection])

  const copyFill = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) return
    const colour = await copyFillFromSelection()
    if (colour) setBaseColor(colour)
  }, [hasSelection])

  return (
    <TabPanel tabId="style">
      <div className="stack-md">
        <PageHelp content="Lighten or darken fills, tweak opacity and borders" />
        {!hasSelection && (
          <InfoCallout title="No selection">Select items to apply styling.</InfoCallout>
        )}

        <section className="stack-sm" title="Adjust colors">
          <div
            className="inline-field"
            style={{ alignItems: 'flex-start', gap: 'var(--space-150)' }}
          >
            <div className="stack-2xs" style={{ alignItems: 'center' }}>
              <span aria-hidden="true" style={{ ...swatch, backgroundColor: baseColor }} />
              <small>Base</small>
              <code>{baseColor}</code>
            </div>
            <div className="stack-2xs" style={{ alignItems: 'center' }}>
              <span
                aria-hidden="true"
                data-testid="adjust-preview"
                style={{ ...swatch, backgroundColor: preview }}
              />
              <small>Adjusted</small>
              <code data-testid="color-hex">{preview}</code>
            </div>
          </div>

          <div className="stack-2xs" style={{ maxWidth: 420 }}>
            <span className="label">Adjust fill</span>
            <Slider
              aria-label="Adjust fill"
              min={-100}
              max={100}
              step={1}
              value={adjust}
              onValueChange={setAdjust}
            />
          </div>
          <div className="stack-2xs" style={{ maxWidth: 200 }}>
            <span className="label">Adjust value</span>
            <Input
              className="input"
              type="number"
              min={-100}
              max={100}
              value={String(adjust)}
              onValueChange={(v) => setAdjust(Number(v))}
              data-testid="adjust-input"
            />
          </div>

          <div className="button-group">
            <BaseButton
              className="button button-primary"
              onClick={() => void apply()}
              disabled={!hasSelection}
            >
              Apply
            </BaseButton>
            <BaseButton
              className="button button-secondary"
              onClick={() => void copyFill()}
              disabled={!hasSelection}
            >
              Copy fill
            </BaseButton>
          </div>
        </section>

        <section className="stack-sm" title="Opacity & border">
          <div className="stack-2xs" style={{ maxWidth: 200 }}>
            <span className="label">Opacity Δ</span>
            <Input
              className="input"
              type="number"
              step="0.1"
              min={-1}
              max={1}
              value={String(opacityDelta)}
              onValueChange={(v) => setOpacityDelta(Number(v))}
              data-testid="opacity-input"
            />
          </div>
          <div className="stack-2xs" style={{ maxWidth: 200 }}>
            <span className="label">Border Δ</span>
            <Input
              className="input"
              type="number"
              value={String(borderDelta)}
              onValueChange={(v) => setBorderDelta(Number(v))}
              data-testid="border-input"
            />
          </div>
          <div className="button-group">
            <BaseButton
              className="button button-secondary"
              onClick={() => void applyOpacity()}
              disabled={!hasSelection}
            >
              Apply opacity
            </BaseButton>
            <BaseButton
              className="button button-secondary"
              onClick={() => void applyBorder()}
              disabled={!hasSelection}
            >
              Apply border
            </BaseButton>
          </div>
        </section>

        <section className="stack-sm" title="Presets">
          <div className="button-group">
            {presetKeys.map((name) => (
              <BaseButton
                key={name}
                className="button"
                onClick={() => void applyStylePreset(name)}
                disabled={!hasSelection}
                title={presetStyle(name)?.description ?? name}
              >
                {name}
              </BaseButton>
            ))}
          </div>
          <InfoCallout title="Presets">
            Style presets adjust fill, stroke, and text colors together for quick theming.
          </InfoCallout>
        </section>

        <StickyActions>
          <div className="button-group">
            <BaseButton
              className="button button-primary"
              onClick={() => void apply()}
              disabled={!hasSelection}
            >
              Apply changes
            </BaseButton>
          </div>
        </StickyActions>
      </div>
    </TabPanel>
  )
}

export default StyleTabV2
