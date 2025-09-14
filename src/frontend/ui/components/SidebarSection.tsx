import { Heading, Paragraph, styled } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

type SidebarSectionProps = Readonly<{
  title: string
  description?: string
  children?: React.ReactNode
  /** Adds top margin; use false for the first section on a page. */
  spaced?: boolean
}>

const Wrapper = styled('section', {
  paddingTop: space[200],
  paddingBottom: space[200],
  display: 'grid',
  rowGap: 'var(--space-200)',
  '& + &': {
    borderTop: `1px solid var(--colors-gray-200)`,
  },
})

export function SidebarSection({
  title,
  description,
  children,
}: SidebarSectionProps): React.JSX.Element {
  return (
    <Wrapper>
      <Heading level={2}>{title}</Heading>
      {description ? <Paragraph size="small">{description}</Paragraph> : null}
      {children}
    </Wrapper>
  )
}
