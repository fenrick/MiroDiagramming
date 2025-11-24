import React from 'react'
import { Button } from '@base-ui-components/react/button'
import { Field } from '@base-ui-components/react/field'
import { Slider } from '@base-ui-components/react/slider'
import { adjustColor } from '../../core/utils/color-utilities'
import { applyStylePreset } from '../../board/format-tools'
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
import { stylePresets } from '../style-presets'

const presetEntries = [...stylePresets.entries()]

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
      <div>
        <PageHelp content="Lighten or darken fills, tweak opacity and borders" />
        {!hasSelection && (
          <InfoCallout title="No selection">Select items to apply styling.</InfoCallout>
        )}

        <section title="Adjust colors">
          <div className="inline-field">
            <div>
              <span aria-hidden="true" />
              <small>Base</small>
              <code>{baseColor}</code>
            </div>
            <div>
              <span aria-hidden="true" data-testid="adjust-preview" />
              <small>Adjusted</small>
              <code data-testid="color-hex">{preview}</code>
            </div>
          </div>

          <Field.Root className="form-group form-group-small">
            <Field.Label>Adjust fill</Field.Label>
            <Slider.Root
              value={adjust}
              min={-100}
              max={100}
              step={1}
              onValueChange={(value) => {
                setAdjust(value)
              }}
              className="slider"
              aria-label="Adjust fill"
            >
              <Slider.Control className="slider-control">
                <Slider.Track className="slider-track">
                  <Slider.Indicator className="slider-indicator" />
                  <Slider.Thumb className="slider-thumb" />
                </Slider.Track>
              </Slider.Control>
            </Slider.Root>
            <Field.Label>Adjust value</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              min={-100}
              max={100}
              value={String(adjust)}
              onValueChange={(v) => {
                setAdjust(Number(v))
              }}
              data-testid="adjust-input"
            />
          </Field.Root>

          <div>
            <Button
              className="button button-primary button-medium"
              onClick={() => void apply()}
              disabled={!hasSelection}
            >
              Apply
            </Button>
            <Button
              className="button button-secondary button-medium"
              onClick={() => void copyFill()}
              disabled={!hasSelection}
            >
              Copy fill
            </Button>
          </div>
        </section>

        <section title="Opacity & border">
          <Field.Root className="form-group form-group-small">
            <Field.Label>Opacity Δ</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              step="0.1"
              min={-1}
              max={1}
              value={String(opacityDelta)}
              onValueChange={(v) => {
                setOpacityDelta(Number(v))
              }}
              data-testid="opacity-input"
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Border Δ</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              value={String(borderDelta)}
              onValueChange={(v) => {
                setBorderDelta(Number(v))
              }}
              data-testid="border-input"
            />
          </Field.Root>
          <div>
            <Button
              className="button button-secondary button-medium"
              onClick={() => void applyOpacity()}
              disabled={!hasSelection}
            >
              Apply opacity
            </Button>
            <Button
              className="button button-secondary button-medium"
              onClick={() => void applyBorder()}
              disabled={!hasSelection}
            >
              Apply border
            </Button>
          </div>
        </section>

        <section title="Presets">
          <div>
            {presetEntries.map(([name, preset]) => (
              <Button
                key={name}
                className="button button-medium"
                onClick={() => void applyStylePreset(preset)}
                disabled={!hasSelection}
                title={name}
              >
                {name}
              </Button>
            ))}
          </div>
          <InfoCallout title="Presets">
            Style presets adjust fill, stroke, and text colors together for quick theming.
          </InfoCallout>
        </section>

        <StickyActions>
          <Button
            className="button button-primary button-medium"
            onClick={() => void apply()}
            disabled={!hasSelection}
          >
            Apply changes
          </Button>
        </StickyActions>
      </div>
    </TabPanel>
  )
}

export default StyleTabV2
