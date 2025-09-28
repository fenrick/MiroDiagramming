import { Button as DSButton } from '@mirohq/design-system'
import { type CSS } from '@stitches/react'
import React from 'react'

export type ButtonProperties = Readonly<
  Omit<
    React.ComponentProps<typeof DSButton>,
    'variant' | 'size' | 'className' | 'style' | 'css'
  > & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
    /** Optional size override. */
    size?: 'small' | 'medium' | 'large' | 'x-large'
    /** Optional icon shown inside the button. */
    icon?: React.ReactNode
    /**
     * Placement of the icon relative to the label.
     * @default 'start'
     */
    iconPosition?: 'start' | 'end'
    /** Optional CSS override for the button. */
    css?: CSS
  }
>

function getIconSlots(
  icon: React.ReactNode,
  iconPosition: 'start' | 'end',
): { start: React.ReactNode; end: React.ReactNode } {
  if (!icon) {
    return { start: null, end: null }
  }
  if (iconPosition === 'start') {
    return {
      start: <DSButton.IconSlot key="icon-start">{icon}</DSButton.IconSlot>,
      end: null,
    }
  }
  if (iconPosition === 'end') {
    return {
      start: null,
      end: <DSButton.IconSlot key="icon-end">{icon}</DSButton.IconSlot>,
    }
  }
  return { start: null, end: null }
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
