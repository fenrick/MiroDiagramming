import React from 'react'

type SidebarSectionProperties = Readonly<{
  title: string
  description?: string
  children?: React.ReactNode
}>

export function SidebarSection({
  title,
  description,
  children,
}: SidebarSectionProperties): React.JSX.Element {
  return (
    <section>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {description ? (
        <p style={{ margin: 0, color: 'var(--secondary-text-color)' }}>{description}</p>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-200)',
          marginTop: 'var(--space-100)',
        }}
      >
        {children}
      </div>
    </section>
  )
}
