import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../tokens';

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
    // Remove style and className so callers cannot override layout
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      style: _style,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      className: _className,
      ...rest
    } = props as {
      style?: React.CSSProperties;
      className?: string;
      [key: string]: unknown;
    };
    return (
      <Primitive.div
        ref={ref}
        style={{ padding: tokens.space[padding] }}
        {...rest}
      />
    );
  },
);
