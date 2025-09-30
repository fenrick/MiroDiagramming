import { Button as DSButton } from '@mirohq/design-system'
import { type CSS } from '@stitches/react'
import React from 'react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
type ButtonSize = 'small' | 'medium' | 'large' | 'x-large'

type NativeButtonProperties = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>

export type ButtonProperties = Readonly<
  NativeButtonProperties & {
    /** Optional design-system fluid layout toggle. */
    fluid?: boolean
    /** Optional loading indicator toggle. */
    loading?: boolean
    /** Optional CSS override for the button. */
    css?: CSS
    variant?: ButtonVariant
    /** Optional size override. */
    size?: ButtonSize
    /** Optional icon shown inside the button. */
    icon?: React.ReactNode
    /**
     * Placement of the icon relative to the label.
     * @default 'start'
     */
    iconPosition?: 'start' | 'end'
  }
>

function getIconSlots(
  icon: React.ReactNode,
  iconPosition: 'start' | 'end',
): { start: React.ReactNode; end: React.ReactNode } {
  if (!icon) {
    return { start: null, end: null }
  }

  const slot = <DSButton.IconSlot key={`icon-${iconPosition}`}>{icon}</DSButton.IconSlot>

  return iconPosition === 'start' ? { start: slot, end: null } : { start: null, end: slot }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProperties>(function Button(
  { variant = 'primary', size, icon, iconPosition = 'start', css, children, ...properties },
  reference,
) {
  const largeByDefault = variant === 'primary' || variant === 'secondary' || variant === 'danger'
  const finalSize = size ?? (largeByDefault ? 'large' : 'medium')

  const { start, end } = getIconSlots(icon, iconPosition)

  return (
    <DSButton ref={reference} variant={variant} size={finalSize} css={css} {...properties}>
      {start}
      <DSButton.Label>{children}</DSButton.Label>
      {end}
    </DSButton>
  )
})
