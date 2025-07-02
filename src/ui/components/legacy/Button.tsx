import React from 'react';
import { Button as DSButton } from '@mirohq/design-system';

export type ButtonProps = Readonly<
  Omit<React.ComponentProps<typeof DSButton>, 'variant' | 'size'> & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
    /**
     * Optional size override. When omitted, primary buttons default to
     * `medium` and all others use `small`.
     */
    size?: 'small' | 'medium';
  }
>;

/** Basic button bridging to the design-system implementation. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size, ...props }, ref) {
    const finalSize = size ?? (variant === 'primary' ? 'medium' : 'small');
    return (
      <DSButton
        ref={ref}
        variant={variant}
        size={finalSize}
        {...props}
      />
    );
  },
);
