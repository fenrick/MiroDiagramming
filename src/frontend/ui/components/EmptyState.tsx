import { Callout, IconInfoCircle, styled } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

type EmptyStateProps = Readonly<{
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}>

const Container = styled('div', {
  textAlign: 'center',
  padding: space[300],
})

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps): React.JSX.Element {
  return (
    <Container role="status" aria-live="polite">
      <Callout
        title={title}
        description={description}
        tone="neutral"
        icon={icon ?? <IconInfoCircle />}
      />
      {action ? <div style={{ marginTop: space[200] }}>{action}</div> : null}
    </Container>
  )
}
