import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../../tokens';

export interface SectionProps
  extends Omit<
    React.ComponentProps<typeof Primitive.div>,
    'className' | 'style'
  > {
  /** Padding token defining the inner spacing. */
  padding?: keyof typeof tokens.space;
}

/**
 * Lightweight wrapper for subsections inside panels or forms.
 *
 * The component exposes a padding prop while ignoring custom class names and
 * inline styles so that spacing decisions remain centralised.
 */
export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  function Section({ padding = 'small', ...props }, ref) {
    const {
      style: _s,
      className: _c,
      ...rest
    } = props as {
      style?: React.CSSProperties;
      className?: string;
      [key: string]: unknown;
    };
    void _s;
    void _c;
    return (
      <Primitive.div
        ref={ref}
        style={{ padding: tokens.space[padding] }}
        {...rest}
      />
    );
  },
);
