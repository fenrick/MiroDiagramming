import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../tokens';

export interface PanelProps
  extends Omit<
    React.ComponentProps<typeof Primitive.section>,
    'className' | 'style'
  > {
  /** Padding token defining the inner spacing. */
  padding?: keyof typeof tokens.space;
}

/**
 * Generic container used by tabs and modals.
 *
 * The component sets consistent padding using design-system tokens and
 * forwards standard HTML attributes. Custom class names and inline styles are
 * intentionally ignored so that spacing stays consistent across tabs.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ padding = 'medium', ...props }, ref) {
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
      <Primitive.section
        ref={ref}
        style={{ padding: tokens.space[padding] }}
        {...rest}
      />
    );
  },
);
