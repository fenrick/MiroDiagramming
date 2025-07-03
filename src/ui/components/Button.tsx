import React from 'react';
import { Button as DSButton, styled } from '@mirohq/design-system';
import { BaseButton } from '@mirohq/design-system-base-button';

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
    /** Optional style override for the button. */
    style?: React.CSSProperties;
  }
>;

const StyledDSButton = styled(DSButton, {
  margin: '0 var(--space-small) var(--space-small) 0',
});

function getIconSlots(
  icon: React.ReactNode,
  iconPosition: 'start' | 'end',
): { start: React.ReactNode; end: React.ReactNode } {
  if (!icon) return { start: null, end: null };
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
      style = {},
      children,
      ...props
    },
    ref,
  ) {
    const finalSize = size ?? (variant === 'primary' ? 'large' : 'medium');

    const { start, end } = getIconSlots(icon, iconPosition);

    if (style && Object.keys(style).length > 0) {
      const LABEL_OFFSET = 2;

      const CustomButton = styled(BaseButton, {
        ...style,
        margin: '0 var(--space-small) var(--space-small) 0',
        whitespace: 'nowrap',
        textOverflow: 'ellipsis',
        textAlign: 'center',
        fontWeight: '$semiBold',
        position: 'relative',
        width: 'fit-content',
        maxWidth: '100%',
        lineHeight: 1,
        border: '1px solid transparent',
        fontSize: '$175',
        height: '$6',
        paddingX: 'calc($100 + '.concat(String(LABEL_OFFSET), 'px)'),
      });

      return (
        <CustomButton
          ref={ref}
          {...props}>
          {start}
          <DSButton.Label>{children}</DSButton.Label>
          {end}
        </CustomButton>
      );
    }

    return (
      <StyledDSButton
        ref={ref}
        variant={variant}
        size={finalSize}
        {...props}>
        {start}
        <DSButton.Label>{children}</DSButton.Label>
        {end}
      </StyledDSButton>
    );
  },
);
