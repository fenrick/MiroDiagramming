import React from 'react'

interface Styleable {
  style?: React.CSSProperties
  className?: string
}

const visuallyHiddenStyle: React.CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
}

export interface VisuallyHiddenProperties {
  readonly children: React.ReactNode
  readonly asChild?: boolean
}

export function VisuallyHidden({ children, asChild }: VisuallyHiddenProperties): React.JSX.Element {
  if (asChild && React.isValidElement(children)) {
    const childProperties = children.props as Styleable
    const mergedStyle = { ...visuallyHiddenStyle, ...childProperties.style }
    const mergedClassName = [childProperties.className, 'visually-hidden'].filter(Boolean).join(' ')
    return React.cloneElement(children, {
      ...childProperties,
      className: mergedClassName,
      style: mergedStyle,
    })
  }

  return <span style={visuallyHiddenStyle}>{children}</span>
}
