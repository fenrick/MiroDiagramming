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
    <output
      aria-live="polite"
      style={{
        textAlign: 'center',
        padding: 'var(--space-300)',
        display: 'block',
      }}
    >
      <div
        style={{
          border: '1px solid var(--indigo200)',
          borderRadius: 'var(--border-radius-medium)',
          padding: 'var(--space-200)',
          background: 'var(--indigo50)',
        }}
      >
        {icon ? <div style={{ marginBottom: 'var(--space-150)' }}>{icon}</div> : null}
        <div style={{ fontWeight: 600, marginBottom: description ? 'var(--space-50)' : 0 }}>
          {title}
        </div>
        {description ? (
          <div style={{ color: 'var(--secondary-text-color)' }}>{description}</div>
        ) : null}
      </div>
      {action ? <div style={{ marginTop: 'var(--space-200)' }}>{action}</div> : null}
    </output>
  )
}
