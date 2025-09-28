import { Callout, styled } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

type EmptyStateProperties = Readonly<{
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}>

const Container = styled('output', {
  textAlign: 'center',
  padding: space[300],
})

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProperties): React.JSX.Element {
  return (
    <Container aria-live="polite">
      <Callout
        title={title}
        description={description}
        variant="primary"
        tone="neutral"
        icon={icon}
      />
      {action ? <div style={{ marginTop: space[200] }}>{action}</div> : null}
    </Container>
  )
}
