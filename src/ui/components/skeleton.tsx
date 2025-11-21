import React from 'react'

export type SkeletonProps = Readonly<{
  width?: string | number
  height?: string | number
}>

export function Skeleton({
  width = '100%',
  height = 'var(--space-250)',
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: 'var(--colors-gray-200)',
        color: 'transparent',
        marginBottom: 'var(--space-100)',
        borderRadius: 'var(--border-radius-medium)',
      }}
      aria-hidden="true"
    />
  )
}
