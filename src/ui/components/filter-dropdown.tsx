import { DropdownMenu, Flex, IconButton, IconFunnel } from '@mirohq/design-system'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import React from 'react'

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
 * Dropdown listing advanced search filters.
 *
 * @param props - FilterDropdown props controlling which search filters are active.
 */
export function FilterDropdown({
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
}: Readonly<FilterDropdownProperties>): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton aria-label="Filters">
          <IconFunnel />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.SwitchItem checked={caseSensitive} onChange={onCaseSensitiveChange}>
          Case sensitive
        </DropdownMenu.SwitchItem>
        <DropdownMenu.SwitchItem checked={wholeWord} onChange={onWholeWordChange}>
          Whole word
        </DropdownMenu.SwitchItem>
        <DropdownMenu.Separator />
        <Flex direction="column" gap={100} css={{ marginBottom: 'var(--space-200)' }}>
          <VisuallyHidden asChild>
            <legend>Widget Types</legend>
          </VisuallyHidden>
          <div>
            {['shape', 'card', 'sticky_note', 'text'].map((t) => (
              <DropdownMenu.CheckboxItem
                key={t}
                checked={widgetTypes.includes(t)}
                onChange={() => toggleType(t)}
              >
                {t}
              </DropdownMenu.CheckboxItem>
            ))}
          </div>
        </Flex>
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
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
