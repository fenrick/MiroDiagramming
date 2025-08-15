import { Button as DSButton, styled } from '@mirohq/design-system';
import { CSS } from '@stitches/react';
import React from 'react';

export type ButtonProps = Readonly<
  Omit<
    React.ComponentProps<typeof DSButton>,
    'variant' | 'size' | 'className' | 'style' | 'css'
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
    /** Optional CSS override for the button. */
    css?: CSS;
  }
>;

const baseMargin = { margin: '0 var(--space-small) var(--space-small) 0' };

const StyledDSButton = styled(DSButton, baseMargin);

function getIconSlots(
  icon: React.ReactNode,
  iconPosition: 'start' | 'end',
): { start: React.ReactNode; end: React.ReactNode } {
  if (!icon) {
    return { start: null, end: null };
  }
  if (iconPosition === 'start') {
    return {
      start: <DSButton.IconSlot key='icon-start'>{icon}</DSButton.IconSlot>,
      end: null,
    };
  }
  if (iconPosition === 'end') {
    return {
      start: null,
      end: <DSButton.IconSlot key='icon-end'>{icon}</DSButton.IconSlot>,
    };
  }
  return { start: null, end: null };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size,
      icon,
      iconPosition = 'start',
      css,
      children,
      ...props
    },
    ref,
  ) {
    const finalSize = size ?? (variant === 'primary' ? 'large' : 'medium');

    const { start, end } = getIconSlots(icon, iconPosition);

    return (
      <StyledDSButton
        ref={ref}
        variant={variant}
        size={finalSize}
        css={css}
        {...props}>
        {start}
        <DSButton.Label>{children}</DSButton.Label>
        {end}
      </StyledDSButton>
    );
  },
);
