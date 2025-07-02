import React from 'react';
import { Button as DSButton } from '@mirohq/design-system';

export type ButtonProps = Readonly<
  Omit<
    React.ComponentProps<typeof DSButton>,
    'variant' | 'size' | 'className' | 'style'
  > & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
    /**
     * Optional size override. When omitted, primary buttons default to
     * `medium` and all others use `small`.
     */
    size?: 'small' | 'medium';
    /** Optional icon shown inside the button. */
    icon?: React.ReactNode;
    /**
     * Placement of the icon relative to the label.
     * @default 'start'
     */
    iconPosition?: 'start' | 'end';
  }
>;

/** Basic button bridging to the design-system implementation. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size,
      icon,
      iconPosition = 'start',
      children,
      ...props
    },
    ref,
  ) {
    const finalSize = size ?? (variant === 'primary' ? 'large' : 'medium');
    let start: React.ReactNode = null;
    let end: React.ReactNode = null;
    if (icon) {
      if (iconPosition === 'start') {
        start = <DSButton.IconSlot key='icon-start'>{icon}</DSButton.IconSlot>;
      } else if (iconPosition === 'end') {
        end = <DSButton.IconSlot key='icon-end'>{icon}</DSButton.IconSlot>;
      }
    }
    return (
      <DSButton
        ref={ref}
        variant={variant}
        size={finalSize}
        {...props}>
        {start}
        <DSButton.Label>{children}</DSButton.Label>
        {end}
      </DSButton>
    );
  },
);
