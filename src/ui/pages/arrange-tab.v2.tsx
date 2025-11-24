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

  const updateCols = (value: string | number): void => {
    const numeric = typeof value === 'number' ? value : Number(value)
    setGrid((current) => ({ ...current, cols: numeric }))
  }

  const updatePadding = (value: string | number): void => {
    const numeric = typeof value === 'number' ? value : Number(value)
    setGrid((current) => ({ ...current, padding: numeric }))
  }

  const toggleSortByName = (): void => {
    setGrid((current) => ({ ...current, sortByName: !current.sortByName }))
  }

  const toggleGroupResult = (): void => {
    setGrid((current) => ({ ...current, groupResult: !current.groupResult }))
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
            <Input className="input" type="number" value={grid.cols} onValueChange={updateCols} />
          </div>
          <div className="stack-2xs">
            <span className="label">Gap</span>
            <Input
              className="input"
              type="number"
              value={grid.padding}
              onValueChange={updatePadding}
            />
          </div>
          <label className="inline-field">
            <Checkbox.Root
              checked={grid.sortByName}
              onCheckedChange={toggleSortByName}
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
                onChange={(event) => {
                  const orientation = event.target.value as GridOptions['sortOrientation']
                  setGrid((current) => ({ ...current, sortOrientation: orientation }))
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
              onCheckedChange={toggleGroupResult}
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
                onValueChange={(value) => {
                  setFrameTitle(value)
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
              onChange={(event) => {
                const axis = event.target.value as SpacingOptions['axis']
                setSpacing({ ...spacing, axis })
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
              value={spacing.spacing}
              onValueChange={(value) => {
                setSpacing({ ...spacing, spacing: Number(value) })
              }}
            />
          </div>
          <div className="stack-2xs">
            <span className="label">Mode</span>
            <select
              className="input"
              value={spacing.mode}
              onChange={(event) => {
                const mode = event.target.value as SpacingOptions['mode']
                setSpacing({ ...spacing, mode })
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
