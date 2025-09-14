import { Form, Grid, IconSlidersX, Slider, Text } from '@mirohq/design-system'
import { colors, space } from '@mirohq/design-tokens'
import React from 'react'

import { applyStylePreset, presetStyle } from '../../board/format-tools'
import {
  copyFillFromSelection,
  extractFillColor,
  tweakBorderWidth,
  tweakFillColor,
  tweakOpacity,
} from '../../board/style-tools'
import { adjustColor } from '../../core/utils/color-utils'
import { Button, ButtonToolbar, InfoCallout, InputField, SidebarSection } from '../components'
import { StickyActions } from '../StickyActions'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'
import { useSelection } from '../hooks/use-selection'
import { STYLE_PRESET_NAMES, stylePresets } from '../style-presets'

import type { TabTuple } from './tab-definitions'

/** Adjusts the fill colour of selected widgets. */
export const StyleTab: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0)
  const selection = useSelection()
  const [baseColor, setBaseColor] = React.useState('#808080')
  const [opacityDelta, setOpacityDelta] = React.useState(0)
  const [borderDelta, setBorderDelta] = React.useState(0)
  // Update base colour when the selection changes
  React.useEffect(() => setBaseColor(extractFillColor(selection[0]) ?? '#808080'), [selection])
  // Preview colour updated live as the user tweaks the slider
  const preview = React.useMemo(() => adjustColor(baseColor, adjust / 100), [baseColor, adjust])
  const apply = async (): Promise<void> => await tweakFillColor(adjust / 100)
  const applyOpacity = React.useCallback(
    async (): Promise<void> => await tweakOpacity(opacityDelta),
    [opacityDelta],
  )
  const applyBorder = React.useCallback(
    async (): Promise<void> => await tweakBorderWidth(borderDelta),
    [borderDelta],
  )
  const copyFill = React.useCallback(async (): Promise<void> => {
    const colour = await copyFillFromSelection()
    if (colour) {
      setBaseColor(colour)
    }
  }, [])
  return (
    <TabPanel tabId="style">
      <PageHelp content="Lighten or darken the fill colour of selected shapes" />
      <SidebarSection title="Adjust Colors">
        <div style={{ marginBottom: 'var(--space-200)' }}>
          <InfoCallout title="Tips">
            Use the slider or enter a value between −100 and 100 to lighten/darken. Copy Fill takes the colour from the current selection.
          </InfoCallout>
        </div>
        <Grid columns={2}>
          <Grid.Item>
            <Form.Field>
              <Form.Label>Adjust fill</Form.Label>
              <Slider
                aria-label="Adjust fill"
                min={-100}
                max={100}
                step={1}
                value={adjust}
                onValueChange={setAdjust}
              >
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumb />
              </Slider>
              <span
                data-testid="adjust-preview"
                style={{
                  display: 'inline-block',
                  width: 'var(--size-thumb)',
                  height: 'var(--size-thumb)',
                  marginLeft: space[200],
                  border: `var(--border-widths-sm) solid ${colors['gray-200']}`,
                  backgroundColor: preview,
                }}
              />
              <code data-testid="color-hex" style={{ marginLeft: space[50] }}>
                {preview}
              </code>
            </Form.Field>
          </Grid.Item>
          <Grid.Item>
            <InputField
              label="Adjust value"
              type="number"
              min={-100}
              max={100}
              value={String(adjust)}
              onValueChange={(v) => setAdjust(Number(v))}
              placeholder="Adjust (-100–100)"
              data-testid="adjust-input"
            />
          </Grid.Item>
          <Grid.Item>
            <InputField
              label="Opacity Δ"
              type="number"
              step="0.1"
              min={-1}
              max={1}
              value={String(opacityDelta)}
              onValueChange={(v) => setOpacityDelta(Number(v))}
              placeholder="Δ opacity (-1–1)"
              data-testid="opacity-input"
            />
          </Grid.Item>
          <Grid.Item>
            <InputField
              label="Border Δ"
              type="number"
              value={String(borderDelta)}
              onValueChange={(v) => setBorderDelta(Number(v))}
              placeholder="Δ width"
              data-testid="border-input"
            />
          </Grid.Item>
          <Grid.Item>
            <StickyActions>
              <ButtonToolbar>
                <Button
                  onClick={apply}
                  type="button"
                  variant="primary"
                  icon={<IconSlidersX />}
                  iconPosition="start"
                >
                  <Text>Apply</Text>
                </Button>
                <Button onClick={applyOpacity} type="button" variant="secondary">
                  <Text>Opacity</Text>
                </Button>
                <Button onClick={applyBorder} type="button" variant="secondary">
                  <Text>Border</Text>
                </Button>
                <Button onClick={copyFill} type="button" variant="ghost">
                  <Text>Copy Fill</Text>
                </Button>
              </ButtonToolbar>
            </StickyActions>
          </Grid.Item>
        </Grid>
      </SidebarSection>
      <SidebarSection title="Style presets">
        <StickyActions>
          <ButtonToolbar>
            {STYLE_PRESET_NAMES.map((name) => {
              const preset = stylePresets[name]
              if (!preset) {
                return null
              }
              const style = presetStyle(preset)
              return (
                <Button
                  key={name}
                  onClick={() => applyStylePreset(preset)}
                  type="button"
                  variant="secondary"
                  css={{
                    color: style.color,
                    backgroundColor: style.fillColor,
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth,
                    borderStyle: 'solid',
                    display: 'inline-block',
                    padding: `0 var(--space-50)`,
                  }}
                >
                  {preset.label}
                </Button>
              )
            })}
          </ButtonToolbar>
        </StickyActions>
      </SidebarSection>
    </TabPanel>
  )
}

export const tabDef: TabTuple = [
  3,
  'style',
  'Colours',
  'Lighten or darken the fill colour of selected shapes',
  StyleTab,
]
