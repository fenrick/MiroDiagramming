/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

import { FilterDropdown } from '../src/ui/components/FilterDropdown'

test('handlers fire when filters change', () => {
  const onCase = vi.fn()
  const onWhole = vi.fn()
  const toggleType = vi.fn()
  const onTags = vi.fn()
  render(
    <FilterDropdown
      widgetTypes={[]}
      toggleType={toggleType}
      tagIds=""
      onTagIdsChange={onTags}
      backgroundColor=""
      onBackgroundColorChange={() => {}}
      assignee=""
      onAssigneeChange={() => {}}
      creator=""
      onCreatorChange={() => {}}
      lastModifiedBy=""
      onLastModifiedByChange={() => {}}
      caseSensitive={false}
      onCaseSensitiveChange={onCase}
      wholeWord={false}
      onWholeWordChange={onWhole}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: /filters/i }))
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /case sensitive/i }))
  expect(onCase).toHaveBeenCalledWith(true)
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'shape' }))
  expect(toggleType).toHaveBeenCalledWith('shape')
  fireEvent.change(screen.getByLabelText(/tag ids/i), {
    target: { value: 'a' },
  })
  expect(onTags).toHaveBeenCalledWith('a')
})
