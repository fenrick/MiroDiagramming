import React from 'react'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Input } from '@base-ui-components/react/input'

import { space } from '@mirohq/design-tokens'
import { IconChevronRightDouble, IconGrid, Text } from '../primitives'
import { applyGridLayout, type GridOptions } from '../../board/grid-tools'
import { boardCache } from '../../board/board-cache'
import { applySpacingLayout, type SpacingOptions } from '../../board/spacing-tools'
import { applyBracketTagsToSelectedStickies } from '../../board/sticky-tags'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { InfoCallout } from '../components/info-callout'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'

const stack = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: space[150],
}

export const ArrangeTabV2: React.FC = () => {
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
    sortOrientation: 'horizontal',
  })
  const [spacing, setSpacing] = React.useState<SpacingOptions>({
    axis: 'x',
    spacing: 20,
    mode: 'move',
  })
  const [frameTitle, setFrameTitle] = React.useState('')

  const updateNumber =
    (key: 'cols' | 'padding') =>
    (value: string): void => {
      const numeric = Number(value)
      setGrid((current) => ({ ...current, [key]: numeric }))
    }

  const toggle = (key: 'groupResult' | 'sortByName') => (): void => {
    setGrid((current) => ({ ...current, [key]: !current[key] }))
  }

  const applyGrid = React.useCallback((): void => {
    if (!hasSelection) return
    boardCache.clearSelection()
    void applyGridLayout({ ...grid, frameTitle })
  }, [frameTitle, grid, hasSelection])

  const applySpacing = React.useCallback((): void => {
    if (!hasSelection) return
    void applySpacingLayout(spacing)
  }, [hasSelection, spacing])

  const applyStickyTags = React.useCallback((): void => {
    if (!hasSelection) return
    void applyBracketTagsToSelectedStickies()
  }, [hasSelection])

  return (
    <TabPanel tabId="arrange">
      <div style={stack}>
        <PageHelp content="Grid and spacing tools" />

        {!hasSelection && (
          <InfoCallout title="No selection">
            Select the widgets you want to arrange before running these tools.
          </InfoCallout>
        )}

        <section className="stack-sm" title="Grid">
          <div className="stack-2xs">
            <span className="label">Columns</span>
            <Input
              className="input"
              type="number"
              value={String(grid.cols)}
              onValueChange={(v) => {
                updateNumber('cols')(String(v))
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Gap</span>
            <Input
              className="input"
              type="number"
              value={String(grid.padding)}
              onValueChange={(v) => {
                updateNumber('padding')(String(v))
              }}
            />
          </div>
          <label className="inline-field">
            <Checkbox.Root
              checked={grid.sortByName}
              onCheckedChange={toggle('sortByName')}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Sort by name</span>
          </label>

          {grid.sortByName && (
            <div className="stack-2xs">
              <span className="label">Fill direction</span>
              <select
                className="input"
                value={grid.sortOrientation}
                onChange={(e) => {
                  setGrid((current) => ({ ...current, sortOrientation: e.target.value as any }))
                }}
              >
                <option value="horizontal">Across rows (left → right)</option>
                <option value="vertical">Down columns (top → bottom)</option>
              </select>
            </div>
          )}

          <label className="inline-field">
            <Checkbox.Root
              checked={grid.groupResult}
              onCheckedChange={toggle('groupResult')}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Group items into Frame</span>
          </label>

          {grid.groupResult && (
            <div className="stack-2xs" style={{ maxWidth: 280 }}>
              <span className="label">Frame title</span>
              <Input
                className="input"
                value={frameTitle}
                onValueChange={(v) => {
                  setFrameTitle(String(v))
                }}
                placeholder="Optional"
              />
            </div>
          )}

          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-primary"
                onClick={applyGrid}
                disabled={!hasSelection}
              >
                <IconGrid />
                <Text>Arrange Grid</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>

        <section className="stack-sm" title="Spacing">
          <div className="stack-2xs">
            <span className="label">Axis</span>
            <select
              className="input"
              value={spacing.axis}
              onChange={(e) => {
                setSpacing({ ...spacing, axis: e.target.value as 'x' | 'y' })
              }}
            >
              <option value="x">Horizontal</option>
              <option value="y">Vertical</option>
            </select>
          </div>
          <div className="stack-2xs">
            <span className="label">Spacing</span>
            <Input
              className="input"
              type="number"
              value={String(spacing.spacing)}
              onValueChange={(v) => {
                setSpacing({ ...spacing, spacing: Number(v) })
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Mode</span>
            <select
              className="input"
              value={spacing.mode}
              onChange={(e) => {
                setSpacing({ ...spacing, mode: e.target.value as 'move' | 'grow' })
              }}
            >
              <option value="move">Move items</option>
              <option value="grow">Resize gaps</option>
            </select>
          </div>
          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-primary"
                onClick={applySpacing}
                disabled={!hasSelection}
              >
                <IconChevronRightDouble />
                <Text>Apply Spacing</Text>
              </BaseButton>
            </div>
          </StickyActions>
        </section>

        <section className="stack-sm" title="Sticky helpers">
          <p>Add [bracket] tags around selected stickies.</p>
          <StickyActions>
            <div className="button-group">
              <BaseButton
                className="button button-secondary"
                onClick={applyStickyTags}
                disabled={!hasSelection}
              >
                Add bracket tags
              </BaseButton>
            </div>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export default ArrangeTabV2
