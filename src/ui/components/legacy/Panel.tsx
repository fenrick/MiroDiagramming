import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../../tokens';

export interface PanelProps
  extends React.ComponentProps<typeof Primitive.section> {
  /** Padding token defining the inner spacing. */
  padding?: keyof typeof tokens.space;
}

/**
 * Generic container used by tabs and modals.
 *
 * The component sets consistent padding using design-system tokens and merges
 * any additional `style` values provided by callers.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ padding = 'medium', style, ...props }, ref) {
    return (
      <Primitive.section
        ref={ref}
        style={{ padding: tokens.space[padding], ...(style ?? {}) }}
        {...props}
      />
    );
  },
);
