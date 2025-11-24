import React from 'react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
type ButtonSize = 'small' | 'medium' | 'large' | 'x-large'

type NativeButtonProperties = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  style?: React.CSSProperties
}

export type ButtonProperties = Readonly<
  NativeButtonProperties & {
    fluid?: boolean
    loading?: boolean
    variant?: ButtonVariant
    size?: ButtonSize
    icon?: React.ReactNode
    iconPosition?: 'start' | 'end'
    css?: React.CSSProperties
  }
>

function getIconSlots(
  icon: React.ReactNode,
  iconPosition: 'start' | 'end',
): { start: React.ReactNode; end: React.ReactNode } {
  if (!icon) {
    return { start: null, end: null }
  }
  const slot = <span aria-hidden="true">{icon}</span>
  return iconPosition === 'start' ? { start: slot, end: null } : { start: null, end: slot }
}

function getVariantClass(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'button-primary'
    case 'secondary':
      return 'button-secondary'
    case 'tertiary':
      return 'button-tertiary'
    case 'ghost':
      return 'button-secondary-border'
    case 'danger':
      return 'button-danger'
    default:
      return 'button-primary'
  }
}

function buildButtonClasses(
  variant: ButtonVariant,
  finalSize: ButtonSize,
  loading?: boolean,
): string {
  const classes = ['button', getVariantClass(variant)]
  if (finalSize === 'small') classes.push('button-small')
  if (finalSize === 'medium') classes.push('button-medium')
  if (loading) classes.push('button-loading')
  return classes.join(' ')
}

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProperties>(function Button(
  {
    variant = 'primary',
    size,
    icon,
    iconPosition = 'start',
    children,
    fluid,
    loading,
    style,
    css,
    ...properties
  },
  reference,
) {
  const largeByDefault = variant === 'primary' || variant === 'secondary' || variant === 'danger'
  const finalSize = size ?? (largeByDefault ? 'large' : 'medium')

  const { start, end } = getIconSlots(icon, iconPosition)
  const className = buildButtonClasses(variant, finalSize, loading)

  return (
    <button
      ref={reference}
      className={className}
      style={fluid ? { width: '100%', ...style, ...css } : { ...style, ...css }}
      {...properties}
    >
      {start}
      <span>{children}</span>
      {end}
    </button>
  )
})

export const Button = Object.assign(BaseButton, {
  IconSlot: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Label: ({ children }: { children: React.ReactNode }) => <>{children}</>,
})
