import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import React from 'react'

import { Checkbox } from './checkbox'
import { InputField } from './input-field'

export interface FilterDropdownProperties {
  widgetTypes: string[]
  toggleType: (t: string) => void
  tagIds: string
  onTagIdsChange: (v: string) => void
  backgroundColor: string
  onBackgroundColorChange: (v: string) => void
  assignee: string
  onAssigneeChange: (v: string) => void
  creator: string
  onCreatorChange: (v: string) => void
  lastModifiedBy: string
  onLastModifiedByChange: (v: string) => void
  caseSensitive: boolean
  onCaseSensitiveChange: (v: boolean) => void
  wholeWord: boolean
  onWholeWordChange: (v: boolean) => void
}

/**
 * Simple collapsible panel listing advanced search filters.
 */
export function FilterDropdown(props: Readonly<FilterDropdownProperties>): React.JSX.Element {
  const {
    widgetTypes,
    toggleType,
    tagIds,
    onTagIdsChange,
    backgroundColor,
    onBackgroundColorChange,
    assignee,
    onAssigneeChange,
    creator,
    onCreatorChange,
    lastModifiedBy,
    onLastModifiedByChange,
    caseSensitive,
    onCaseSensitiveChange,
    wholeWord,
    onWholeWordChange,
  } = props

  return (
    <details>
      <summary style={{ cursor: 'pointer' }}>Filters</summary>
      <div
        style={{
          padding: 'var(--space-150) var(--space-50)',
          display: 'grid',
          gap: 'var(--space-100)',
        }}
      >
        <Checkbox label="Case sensitive" value={caseSensitive} onChange={onCaseSensitiveChange} />
        <Checkbox label="Whole word" value={wholeWord} onChange={onWholeWordChange} />
        <VisuallyHidden asChild>
          <legend>Widget Types</legend>
        </VisuallyHidden>
        <div style={{ display: 'grid', gap: 'var(--space-50)' }}>
          {['shape', 'card', 'sticky_note', 'text'].map((t) => (
            <Checkbox
              key={t}
              label={t}
              value={widgetTypes.includes(t)}
              onChange={() => {
                toggleType(t)
              }}
            />
          ))}
        </div>
        <InputField
          label="Tag IDs"
          value={tagIds}
          onValueChange={onTagIdsChange}
          placeholder="Comma separated"
        />
        <InputField
          label="Background colour"
          value={backgroundColor}
          onValueChange={onBackgroundColorChange}
          placeholder="CSS colour"
        />
        <InputField
          label="Assignee ID"
          value={assignee}
          onValueChange={onAssigneeChange}
          placeholder="User ID"
        />
        <InputField
          label="Creator ID"
          value={creator}
          onValueChange={onCreatorChange}
          placeholder="User ID"
        />
        <InputField
          label="Last modified by"
          value={lastModifiedBy}
          onValueChange={onLastModifiedByChange}
          placeholder="User ID"
        />
      </div>
    </details>
  )
}
