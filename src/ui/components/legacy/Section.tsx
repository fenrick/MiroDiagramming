import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../../tokens';

export interface SectionProps
  extends React.ComponentProps<typeof Primitive.div> {
  /** Padding token defining the inner spacing. */
  padding?: keyof typeof tokens.space;
}

/**
 * Lightweight wrapper for subsections inside panels or forms.
 *
 * The component exposes a padding prop and merges extra `style` properties
 * before forwarding all other attributes to the underlying div element.
 */
export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  function Section({ padding = 'small', style, ...props }, ref) {
    return (
      <Primitive.div
        ref={ref}
        style={{ padding: tokens.space[padding], ...(style ?? {}) }}
        {...props}
      />
    );
  },
);
