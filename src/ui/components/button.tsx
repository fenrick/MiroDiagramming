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
    ...props
  },
  reference,
) {
  const largeByDefault = variant === 'primary' || variant === 'secondary' || variant === 'danger'
  const finalSize = size ?? (largeByDefault ? 'large' : 'medium')

  const { start, end } = getIconSlots(icon, iconPosition)
  const classes = ['button']
  const variantClass: Record<ButtonVariant, string> = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    tertiary: 'button-tertiary',
    ghost: 'button-secondary-border',
    danger: 'button-danger',
  }
  classes.push(variantClass[variant])
  if (finalSize === 'small') classes.push('button-small')
  if (finalSize === 'medium') classes.push('button-medium')
  if (loading) classes.push('button-loading')

  return (
    <button
      ref={reference}
      className={classes.join(' ')}
      style={fluid ? { width: '100%', ...style, ...css } : { ...style, ...css }}
      {...props}
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
