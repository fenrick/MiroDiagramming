import React from 'react'

type EmptyStateProperties = Readonly<{
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}>

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProperties): React.JSX.Element {
  return (
    <output aria-live="polite">
      <div>
        {icon ? <div>{icon}</div> : null}
        <div>{title}</div>
        {description ? <div>{description}</div> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </output>
  )
}
