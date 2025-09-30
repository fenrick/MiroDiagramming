import { Flex, Form, Grid, IconSlidersX, Slider, Text } from '@mirohq/design-system'
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
import { adjustColor } from '../../core/utils/color-utilities'
import {
  Button,
  ButtonToolbar,
  EmptyState,
  InfoCallout,
  InputField,
  Paragraph,
  SidebarSection,
} from '../components'
import { StickyActions } from '../sticky-actions'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { useSelection } from '../hooks/use-selection'
import { STYLE_PRESET_NAMES, stylePresets } from '../style-presets'

import type { TabTuple } from './tab-definitions'

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

const SWATCH_BASE_STYLE = {
  display: 'inline-block',
  width: 'var(--size-thumb)',
  height: 'var(--size-thumb)',
  borderRadius: 'var(--radius-md)',
  border: `var(--border-widths-sm) solid ${colors['gray-200']}`,
} as const

const formatSelectionLabel = (count: number): string => {
  if (count <= 0) {
    return 'No selection'
  }
  const noun = count === 1 ? 'item' : 'items'
  return `${count.toLocaleString()} selected ${noun}`
}

export const StyleTab: React.FC = () => {
  const [adjust, setAdjust] = React.useState(0)
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const selectionLabel = formatSelectionLabel(selection.length)
  const [baseColor, setBaseColor] = React.useState('#808080')
  const [opacityDelta, setOpacityDelta] = React.useState(0)
  const [borderDelta, setBorderDelta] = React.useState(0)
  React.useEffect(() => {
    setBaseColor(extractFillColor(selection[0]) ?? '#808080')
  }, [selection])
  const preview = React.useMemo(() => adjustColor(baseColor, adjust / 100), [baseColor, adjust])

  const apply = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    await tweakFillColor(adjust / 100)
  }, [adjust, hasSelection])

  const applyOpacity = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    await tweakOpacity(opacityDelta)
  }, [opacityDelta, hasSelection])

  const applyBorder = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    await tweakBorderWidth(borderDelta)
  }, [borderDelta, hasSelection])

  const copyFill = React.useCallback(async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    const colour = await copyFillFromSelection()
    if (colour) {
      setBaseColor(colour)
    }
  }, [hasSelection])

  return (
    <TabPanel tabId="style">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Lighten or darken the fill colour of selected shapes" />
        {hasSelection ? null : (
          <EmptyState
            title="No selection"
            description="Select one or more items to apply styling."
          />
        )}
        <SidebarSection title="Adjust Colors">
          <Flex direction="column" gap={200}>
            <Paragraph>
              {selectionLabel}. Negative values darken, positive values lighten. Copy Fill samples
              from the current selection.
            </Paragraph>
            <Flex align="center" gap={150} wrap="wrap">
              <Flex direction="column" align="center" gap={50}>
                <span
                  aria-hidden="true"
                  style={{ ...SWATCH_BASE_STYLE, backgroundColor: baseColor }}
                />
                <Text size="xs">Base</Text>
                <code>{baseColor}</code>
              </Flex>
              <Flex direction="column" align="center" gap={50}>
                <span
                  aria-hidden="true"
                  data-testid="adjust-preview"
                  style={{ ...SWATCH_BASE_STYLE, backgroundColor: preview }}
                />
                <Text size="xs">Adjusted</Text>
                <code data-testid="color-hex">{preview}</code>
              </Flex>
            </Flex>
          </Flex>
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
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
              </Form.Field>
            </Grid.Item>
            <Grid.Item>
              <InputField
                label="Adjust value"
                type="number"
                min={-100}
                max={100}
                value={String(adjust)}
                onValueChange={(v) => {
                  setAdjust(Number(v))
                }}
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
                onValueChange={(v) => {
                  setOpacityDelta(Number(v))
                }}
                placeholder="Δ opacity (-1–1)"
                data-testid="opacity-input"
              />
            </Grid.Item>
            <Grid.Item>
              <InputField
                label="Border Δ"
                type="number"
                value={String(borderDelta)}
                onValueChange={(v) => {
                  setBorderDelta(Number(v))
                }}
                placeholder="Δ width"
                data-testid="border-input"
              />
            </Grid.Item>
            <Grid.Item>
              <StickyActions>
                <ButtonToolbar>
                  <Button
                    onClick={() => {
                      void apply()
                    }}
                    type="button"
                    variant="primary"
                    icon={<IconSlidersX />}
                    iconPosition="start"
                    disabled={!hasSelection}
                  >
                    <Text>Apply</Text>
                  </Button>
                  <Button
                    onClick={() => {
                      void applyOpacity()
                    }}
                    type="button"
                    variant="secondary"
                    disabled={!hasSelection}
                  >
                    <Text>Opacity</Text>
                  </Button>
                  <Button
                    onClick={() => {
                      void applyBorder()
                    }}
                    type="button"
                    variant="secondary"
                    disabled={!hasSelection}
                  >
                    <Text>Border</Text>
                  </Button>
                  <Button
                    onClick={() => {
                      void copyFill()
                    }}
                    type="button"
                    variant="ghost"
                    disabled={!hasSelection}
                  >
                    <Text>Copy Fill</Text>
                  </Button>
                </ButtonToolbar>
              </StickyActions>
            </Grid.Item>
          </Grid>
        </SidebarSection>
        <SidebarSection title="Style presets">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="Presets">
              Apply curated combinations of fill, text, and border styling in one click.
            </InfoCallout>
          </div>
          <StickyActions>
            <ButtonToolbar>
              {STYLE_PRESET_NAMES.map((name) => {
                const preset = stylePresets.get(name)
                if (!preset) {
                  return null
                }
                const style = presetStyle(preset)
                return (
                  <Button
                    key={name}
                    onClick={() => {
                      void applyStylePreset(preset)
                    }}
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
                    disabled={!hasSelection}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </ButtonToolbar>
          </StickyActions>
        </SidebarSection>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  3,
  'style',
  'Colours',
  'Lighten or darken the fill colour of selected shapes',
  StyleTab,
]
